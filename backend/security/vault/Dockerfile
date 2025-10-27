FROM hashicorp/vault:1.20.4

USER root

COPY config/config.hcl /vault/config/config.hcl
COPY tls/ /vault/tls/

RUN mkdir -p /vault/data /vault/logs && \
	chmod 700 /vault/data /vault/logs

COPY entrypoint-wrapper.sh /usr/local/bin/vault-entrypoint.sh
RUN chmod +x /usr/local/bin/vault-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/vault-entrypoint.sh"]