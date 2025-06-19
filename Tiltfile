load("./tilt/docker.tilt", "docker_factory")

def main():
  bake_factory = (
    docker_factory.bake()
    .add_file_dependencies(
      "container-bake.hcl",
      "renderers",
      "./Tiltfile",
    )
  )

  bake_factory.create_resource()

  docker_compose('./container-compose.yaml')

main()
