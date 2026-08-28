#!/usr/bin/env python3
"""Start one or more local servers, wait until their ports accept connections,
run a command, then shut everything down.

Usage:
  with_server.py --server CMD --port PORT [--server CMD --port PORT ...] -- COMMAND [ARGS...]

Options:
  --server CMD        Shell command that starts a server. Repeatable.
  --port PORT         Port the preceding --server will listen on. Repeatable,
                      one per --server, in the same order.
  --host HOST         Host to probe for readiness (default: 127.0.0.1).
  --timeout SECONDS   Readiness timeout per server (default: 120).
  --cwd DIR           Working directory for the servers and the command.
  --keep-logs         Print each server's captured output at the end.

Examples:
  with_server.py --server "npm run dev" --port 5173 -- python automation.py

  with_server.py \\
    --server "cd backend && python server.py" --port 3000 \\
    --server "cd frontend && npm run dev" --port 5173 \\
    -- python automation.py

Exit code is the exit code of COMMAND. Servers are always terminated, including
on failure or Ctrl-C.
"""

import argparse
import os
import signal
import socket
import subprocess
import sys
import tempfile
import time


def parse_args(argv):
    if "--" not in argv:
        sys.exit("error: missing `--` separating server options from the command to run")
    split = argv.index("--")
    own, command = argv[:split], argv[split + 1 :]
    if not command:
        sys.exit("error: no COMMAND given after `--`")

    parser = argparse.ArgumentParser(
        prog="with_server.py", add_help=True, description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--server", action="append", default=[], metavar="CMD")
    parser.add_argument("--port", action="append", default=[], type=int, metavar="PORT")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--timeout", type=float, default=120.0)
    parser.add_argument("--cwd", default=None)
    parser.add_argument("--keep-logs", action="store_true")
    args = parser.parse_args(own)

    if not args.server:
        sys.exit("error: at least one --server is required")
    if len(args.server) != len(args.port):
        sys.exit(
            f"error: {len(args.server)} --server option(s) but {len(args.port)} --port option(s); "
            "each server needs exactly one port, in matching order"
        )
    return args, command


def port_open(host, port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(1.0)
        return sock.connect_ex((host, port)) == 0


def wait_for_port(host, port, timeout, proc, name):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if proc.poll() is not None:
            return False, f"{name} exited with code {proc.returncode} before opening port {port}"
        if port_open(host, port):
            return True, None
        time.sleep(0.25)
    return False, f"{name} did not open port {port} within {timeout:.0f}s"


def terminate(proc):
    if proc.poll() is not None:
        return
    try:
        os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
    except (ProcessLookupError, PermissionError):
        proc.terminate()
    try:
        proc.wait(timeout=10)
    except subprocess.TimeoutExpired:
        try:
            os.killpg(os.getpgid(proc.pid), signal.SIGKILL)
        except (ProcessLookupError, PermissionError):
            proc.kill()
        proc.wait(timeout=5)


def main(argv):
    args, command = parse_args(argv)
    servers = []  # (name, proc, log_file)
    exit_code = 1

    try:
        for index, (cmd, port) in enumerate(zip(args.server, args.port), start=1):
            name = f"server{index} ({cmd})"
            log = tempfile.NamedTemporaryFile(
                mode="w+", suffix=f".server{index}.log", delete=False
            )
            proc = subprocess.Popen(
                cmd, shell=True, cwd=args.cwd, stdout=log, stderr=subprocess.STDOUT,
                start_new_session=True,
            )
            servers.append((name, proc, log))
            print(f"[with_server] starting {name} -> {args.host}:{port}", file=sys.stderr)

            ready, error = wait_for_port(args.host, port, args.timeout, proc, name)
            if not ready:
                log.flush()
                with open(log.name) as handle:
                    tail = handle.read()[-4000:]
                print(f"[with_server] {error}", file=sys.stderr)
                if tail.strip():
                    print(f"[with_server] output of {name}:\n{tail}", file=sys.stderr)
                return 1
            print(f"[with_server] {name} ready on port {port}", file=sys.stderr)

        exit_code = subprocess.call(command, cwd=args.cwd)
        return exit_code
    except KeyboardInterrupt:
        print("[with_server] interrupted", file=sys.stderr)
        return 130
    finally:
        for name, proc, log in reversed(servers):
            terminate(proc)
            log.flush()
            log.close()
            if args.keep_logs:
                with open(log.name) as handle:
                    print(f"\n[with_server] --- output of {name} ---\n{handle.read()}",
                          file=sys.stderr)
            else:
                try:
                    os.unlink(log.name)
                except OSError:
                    pass
        print("[with_server] all servers stopped", file=sys.stderr)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
