listener "tcp" {
    address = "0.0.0.0:8200"
    tls_disable = 1
    # ENABLE TLS CERT AND KEY IN PRODUCTION
}

api_addr = "https://vault:8200"
cluster_addr = "https://vault:8201"

storage "raft" {
    path = "/vault/data"
}

disable_mlock = false