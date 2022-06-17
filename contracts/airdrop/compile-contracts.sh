#!/bin/sh

if ! [ -x "$(command -v docker)" ]; then
    echo "docker needs to be installed"
    exit
fi

cd build-tools
docker build . --tag rust-ro-plus
cd ..

CHAIN=$1

if [ "$CHAIN" = "all" ] || [ "$CHAIN" = "terra" ]; then
docker run --rm -v "$(pwd)":/code --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry rust-ro-plus -- . terra
fi

if [ "$CHAIN" = "all" ] || [ "$CHAIN" = "cosmos" ]; then
docker run --rm -v "$(pwd)":/code --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry rust-ro-plus -- . cosmos --features=cosmos --no-default-features
fi

if [ "$CHAIN" = "all" ] || [ "$CHAIN" = "solana" ]; then
docker run --rm -v "$(pwd)":/code --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry rust-ro-plus -- . solana --features=solana --no-default-features
fi

if [ "$CHAIN" = "all" ] || [ "$CHAIN" = "eth" ]; then
docker run --rm -v "$(pwd)":/code --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry rust-ro-plus -- . eth --features=eth --no-default-features
fi