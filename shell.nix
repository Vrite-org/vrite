{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    erlang_27
    elixir_1_15
    nodejs_22
    yarn
  ];

  shellHook = ''
    echo "Elixir version: $(elixir --version | tail -n 1)"
    echo "NodeJS version: $(node -v)"
    echo "Yarn version: $(yarn -v)"
  '';
}
