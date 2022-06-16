FROM cosmwasm/rust-optimizer:0.12.6

# Add script as entry point
COPY optimize.sh /usr/local/bin

ENTRYPOINT ["optimize.sh"]
# Default argument when none is provided
CMD ["."]