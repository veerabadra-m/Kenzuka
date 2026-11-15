import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

function EmbroideryMachine() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let disposed = false
    let animationFrame = 0
    let model: THREE.Group | null = null

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 1000)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    })

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setClearColor(0x000000, 0)

    mount.appendChild(renderer.domElement)

    // Soft workshop illumination
    const ambient = new THREE.HemisphereLight(
      0xffffff,
      0x35251a,
      2.0
    )
    scene.add(ambient)

    // Main warm spotlight
    const spotlight = new THREE.SpotLight(
      0xffd39a,
      45,
      30,
      Math.PI / 5,
      0.65,
      1.2
    )
    spotlight.position.set(2.5, 4, 5)
    spotlight.target.position.set(0, 0, 0)
    spotlight.castShadow = true
    spotlight.shadow.mapSize.set(1024, 1024)
    scene.add(spotlight)
    scene.add(spotlight.target)

    // Soft front fill light
    const fillLight = new THREE.DirectionalLight(0xffe5c4, 3)
    fillLight.position.set(-3, 2, 4)
    scene.add(fillLight)

    // Subtle warm side illumination
    const sideLight = new THREE.PointLight(0xffa94d, 5, 12)
    sideLight.position.set(-3, 1, -1)
    scene.add(sideLight)

    const resize = () => {
      const width = Math.max(mount.clientWidth, 1)
      const height = Math.max(mount.clientHeight, 1)

      camera.aspect = width / height
      camera.updateProjectionMatrix()

      renderer.setSize(width, height, false)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)
    resize()

    const loader = new GLTFLoader()

    loader.load(
      '/embroidery_machine.glb',
      (gltf) => {
        if (disposed) return

        model = gltf.scene

        // Center and automatically scale the downloaded model
        const bounds = new THREE.Box3().setFromObject(model)
        const center = bounds.getCenter(new THREE.Vector3())
        const dimensions = bounds.getSize(new THREE.Vector3())
        const largestDimension = Math.max(
          dimensions.x,
          dimensions.y,
          dimensions.z,
          0.001
        )

        const modelScale = 2.5 / largestDimension
        model.scale.setScalar(modelScale)
        model.position.set(
          -center.x * modelScale,
          -center.y * modelScale,
          -center.z * modelScale
        )

        model.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = true
            object.receiveShadow = true
          }
        })

        scene.add(model)

        const fovRadians = THREE.MathUtils.degToRad(camera.fov)
        const cameraDistance =
          (2.5 / (2 * Math.tan(fovRadians / 2))) * 1.35

        camera.position.set(
          0,
          cameraDistance * 0.16,
          cameraDistance
        )
        camera.lookAt(0, 0, 0)
      },
      undefined,
      (error) => {
        console.error('Could not load embroidery machine GLB:', error)
      }
    )

    const render = () => {
      if (disposed) return

      animationFrame = requestAnimationFrame(render)
      renderer.render(scene, camera)
    }

    render()

    return () => {
      disposed = true
      cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()

          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material]

          materials.forEach((material) => material.dispose())
        }
      })

      renderer.dispose()

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }

      model = null
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="embroidery-machine-canvas"
      aria-label="3D KENZUKA embroidery machine"
    />
  )
}

export default EmbroideryMachine
