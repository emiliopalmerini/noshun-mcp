{
  description = "Notion MCP server for Claude Code";

  inputs = {
    nixpkgs.url = "nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        packages.default = pkgs.buildNpmPackage {
          pname = "noshun-mcp";
          version = "0.1.0";
          src = ./.;

          npmDepsHash = "sha256-a/s76ZkQg9PxAHy6nMef10mVz0/gRMYZZL2KifT4rho=";
          dontNpmBuild = true;

          installPhase = ''
            mkdir -p $out/lib/noshun-mcp
            cp -r node_modules $out/lib/noshun-mcp/
            cp -r src $out/lib/noshun-mcp/
            cp index.ts package.json tsconfig.json $out/lib/noshun-mcp/

            mkdir -p $out/bin
            cat > $out/bin/noshun-mcp <<EOF
            #!/bin/sh
            exec ${pkgs.bun}/bin/bun $out/lib/noshun-mcp/index.ts "\$@"
            EOF
            chmod +x $out/bin/noshun-mcp
          '';
        };

        devShells.default = pkgs.mkShell {
          packages = [ pkgs.bun ];
        };
      });
}
