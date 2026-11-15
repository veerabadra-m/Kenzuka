import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

function Kenzuka3DScene() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let disposed = false
    let animationFrame = 0
    let machine: THREE.Group | null = null

    const scene = new THREE.Scene()

    // Orthographic camera keeps the cube proportions consistent.
    const viewSize = 4.9

    const camera = new THREE.OrthographicCamera(
      -viewSize / 2,
      viewSize / 2,
      viewSize / 2,
      -viewSize / 2,
      0.1,
      100
    )

    camera.position.set(0, 1.8, 7.4)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    })

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.setClearColor(0x000000, 0)

    mount.appendChild(renderer.domElement)

    // Everything inside this group rotates together.
    const workshop = new THREE.Group()
    workshop.rotation.set(-0.18, -0.35, 0)
    scene.add(workshop)

    const applyRotation = (event: Event) => {
      const detail = (event as CustomEvent<{ x: number; y: number }>).detail
      workshop.rotation.set(detail.x, detail.y, 0)
    }

    mount.addEventListener('kenzuka-rotation', applyRotation)

    // KENZUKA logo texture for the five exterior faces.
    const textureLoader = new THREE.TextureLoader()
    const logoTexture = textureLoader.load('/KENZUKA.jpeg')
    logoTexture.colorSpace = THREE.SRGBColorSpace
    logoTexture.anisotropy = renderer.capabilities.getMaxAnisotropy()
    logoTexture.generateMipmaps = true
    logoTexture.minFilter = THREE.LinearMipmapLinearFilter
    logoTexture.magFilter = THREE.LinearFilter
    logoTexture.needsUpdate = true

    const half = 1.7
    const size = half * 2

    const logoMaterial = new THREE.MeshStandardMaterial({
      map: logoTexture,
      roughness: 0.78,
      metalness: 0.05,
      side: THREE.DoubleSide,
    })

    const openMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })

    // BoxGeometry face order: right, left, top, bottom, front, back.
    const shell = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      [
        logoMaterial,
        logoMaterial,
        logoMaterial,
        logoMaterial,
        openMaterial,
        logoMaterial,
      ]
    )

    shell.castShadow = true
    shell.receiveShadow = true
    workshop.add(shell)

    // Dark inner workshop walls, floor and ceiling.
    const interiorMaterial = new THREE.MeshStandardMaterial({
      color: 0x171713,
      roughness: 0.88,
      metalness: 0.12,
      side: THREE.DoubleSide,
    })

    const addInteriorPanel = (
      x: number,
      y: number,
      z: number,
      rotationX: number,
      rotationY: number
    ) => {
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(size - 0.06, size - 0.06),
        interiorMaterial
      )

      panel.position.set(x, y, z)
      panel.rotation.set(rotationX, rotationY, 0)
      panel.receiveShadow = true
      workshop.add(panel)
    }

    addInteriorPanel(0, 0, -half + 0.025, 0, 0)
    addInteriorPanel(-half + 0.025, 0, 0, 0, Math.PI / 2)
    addInteriorPanel(half - 0.025, 0, 0, 0, -Math.PI / 2)
    addInteriorPanel(0, half - 0.025, 0, Math.PI / 2, 0)
    addInteriorPanel(0, -half + 0.025, 0, -Math.PI / 2, 0)

    // Workshop lighting.
    const ambient = new THREE.HemisphereLight(
      0xffffff,
      0x34251a,
      1.8
    )
    workshop.add(ambient)

    const spotlight = new THREE.SpotLight(
      0xffd39a,
      65,
      12,
      Math.PI / 4,
      0.6,
      1
    )

    spotlight.position.set(0.2, 3.1, 2.2)
    spotlight.target.position.set(0, -0.3, 0)
    spotlight.castShadow = true
    spotlight.shadow.mapSize.set(2048, 2048)
    spotlight.shadow.bias = -0.0001

    workshop.add(spotlight)
    workshop.add(spotlight.target)

    const fillLight = new THREE.DirectionalLight(0xffe4c1, 2.5)
    fillLight.position.set(-3, 2, 4)
    workshop.add(fillLight)

    const sideLight = new THREE.PointLight(0xffa94d, 12, 8)
    sideLight.position.set(-1.3, 0.8, -0.5)
    workshop.add(sideLight)

    // Load the actual embroidery machine model.
    const loader = new GLTFLoader()

    loader.load(
      '/embroidery_machine.glb',
      (gltf) => {
        if (disposed) {
          gltf.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              object.geometry.dispose()
            }
          })
          return
        }

        machine = gltf.scene

        machine.updateMatrixWorld(true)

        const bounds = new THREE.Box3().setFromObject(machine)
        const center = bounds.getCenter(new THREE.Vector3())
        const dimensions = bounds.getSize(new THREE.Vector3())

        const largestDimension = Math.max(
          dimensions.x,
          dimensions.y,
          dimensions.z,
          0.001
        )

        const modelScale = 2.35 / largestDimension

        machine.scale.setScalar(modelScale)
        machine.position.set(
          -center.x * modelScale,
          -center.y * modelScale - 0.48,
          -center.z * modelScale
        )

        const maxAnisotropy = renderer.capabilities.getMaxAnisotropy()

        machine.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = true
            object.receiveShadow = true

            const materials = Array.isArray(object.material)
              ? object.material
              : [object.material]

            materials.forEach((material) => {
              Object.values(material).forEach((value) => {
                if (value instanceof THREE.Texture) {
                  value.anisotropy = maxAnisotropy
                  value.needsUpdate = true
                }
              })

              material.needsUpdate = true
            })
          }
        })

        workshop.add(machine)
      },
      undefined,
      (error) => {
        console.error('Embroidery machine GLB loading failed:', error)
      }
    )

    const resize = () => {
      const width = Math.max(mount.clientWidth, 1)
      const height = Math.max(mount.clientHeight, 1)

      const aspect = width / height

      camera.left = (-viewSize * aspect) / 2
      camera.right = (viewSize * aspect) / 2
      camera.top = viewSize / 2
      camera.bottom = -viewSize / 2

      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)
    resize()

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
      mount.removeEventListener('kenzuka-rotation', applyRotation)

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()

          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material]

          materials.forEach((material) => material.dispose())
        }
      })

      logoTexture.dispose()
      renderer.dispose()

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }

      machine = null
    }
  }, [])

  const dragRef = useRef({
    active: false,
    lastX: 0,
    lastY: 0,
  })

  const rotationRef = useRef({ x: -0.18, y: -0.35 })

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current.active = true
    dragRef.current.lastX = event.clientX
    dragRef.current.lastY = event.clientY
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.classList.add('is-dragging')
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return

    const deltaX = event.clientX - dragRef.current.lastX
    const deltaY = event.clientY - dragRef.current.lastY

    dragRef.current.lastX = event.clientX
    dragRef.current.lastY = event.clientY

    rotationRef.current.y += deltaX * 0.007
    rotationRef.current.x -= deltaY * 0.007

    const mount = mountRef.current
    if (mount) {
      mount.dispatchEvent(
        new CustomEvent('kenzuka-rotation', {
          detail: {
            x: rotationRef.current.x,
            y: rotationRef.current.y,
          },
        })
      )
    }
  }

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current.active = false
    event.currentTarget.classList.remove('is-dragging')

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <div
      className="kenzuka-three-scene"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      aria-label="Interactive three-dimensional KENZUKA embroidery workshop"
    >
      <div ref={mountRef} className="kenzuka-three-mount" />
    </div>
  )
}

export default Kenzuka3DScene
