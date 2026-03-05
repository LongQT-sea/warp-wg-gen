# Why

Because who doesn't like a Web-based tool to generate Cloudflare WARP WireGuard configuration files.
- Register and generate WireGuard configs from the Cloudflare WARP API
- Pure client-side WireGuard key generation (Curve25519)
> [!Important]
> For best practice, use guest browser profile when generating configs.

## References

[wgcf/cloudflare/api.go](https://github.com/ViRb3/wgcf/blob/master/cloudflare/api.go) — reference implementation showing the TLS 1.2 requirement and cipher configuration needed to communicate with the Cloudflare WARP API.

## License

This project is licensed under [GPL-2.0](LICENSE).

WireGuard key generation code is from [wireguard-tools](https://git.zx2c4.com/wireguard-tools/tree/contrib/keygen-html/wireguard.js) by Jason A. Donenfeld, licensed under GPL-2.0.

## Disclaimer

Not affiliated with or endorsed by Cloudflare, Inc. Use in accordance with [Cloudflare's Terms of Service](https://www.cloudflare.com/application/terms/).
