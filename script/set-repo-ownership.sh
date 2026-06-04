#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd ${SCRIPT_DIR}/.. || exit 1

chown -R dxb.apache *
chown -R dxb.apache .*
chmod 755 ./script/*.sh
chmod 644 ./script/*.txt
