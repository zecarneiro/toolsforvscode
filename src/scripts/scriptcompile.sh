#!/usr/bin/env bash
# José M. C. Noronha

declare __WIN__="node_modules/sqlite3/lib/binding/napi-v3-win32-x64"
declare __LINUX__="node_modules/sqlite3/lib/binding/napi-v3-linux-x64"
declare __NODE_SQLITE3_WIN__="node_sqlite3_win.node"
declare __NODE_SQLITE3_LINUX__="node_sqlite3_linux.node"
declare __NODE_SQLITE3__="node_sqlite3.node"
declare __LIB_NODE_MODULE__="lib-node-module"

if [ ! -f "$__WIN__/${__NODE_SQLITE3__}" ]; then
    mkdir -p "$__WIN__"
    cp "$__LIB_NODE_MODULE__/$__NODE_SQLITE3_WIN__" "$__WIN__/${__NODE_SQLITE3__}"
fi

if [ ! -f "$__LINUX__/${__NODE_SQLITE3__}" ]; then
    mkdir -p "$__LINUX__"
    cp "$__LIB_NODE_MODULE__/$__NODE_SQLITE3_LINUX__" "$__LINUX__/${__NODE_SQLITE3__}"
fi
