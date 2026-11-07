import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Stars, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export default function App() {
  const [selectedOrgan, setSelectedOrgan] = useState('heart');
  const [activeTab, setActiveTab] = useState('explorer');
  const [disassembled, setDisassembled] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(0.005);
  const [heartRate, setHeartRate] = useState(72);
  const [bodyTemp, setBodyTemp] = useState(36.6);
  const [oxygenLevel, setOxygenLevel] = useState(98);
  const [notifications, setNotifications] = useState<Array<{ id: number; msg: string }>>([]);

  const organsData = {
    heart: {
      name: 'Coração (Heart)',
      system: 'Sistema Cardiovascular',
      weight: 'Aprox. 250 - 350g',
      color: '#ef4444',
      description: 'O coração é um órgão muscular oco que bombeia sangue através do sistema circulatório por meio de contrações rítmicas.',
      clinicalNotes: [
        'Débito cardíaco médio em repouso: 5 L/min.',
        'Divide-se em 4 câmaras: 2 átrios e 2 ventrículos.',
        'Possui sistema elétrico próprio (nó sinusal).',
      ],
      layers: ['Pericárdio', 'Miocárdio', 'Endocárdio', 'Válvulas Cardíacas'],
    },
    lungs: {
      name: 'Pulmões (Lungs)',
      system: 'Sistema Respiratório',
      weight: 'Aprox. 1.000g - 1.300g (par)',
      color: '#3b82f6',
      description: 'Órgãos esponjosos responsáveis pelas trocas gasosas (hematose): absorção de oxigênio e eliminação de dióxido de carbono.',
      clinicalNotes: [
        'Capacidade pulmonar total média: ~6 litros.',
        'Compostos por cerca de 300 milhões de alvéolos.',
        'O pulmão direito possui 3 lobos; o esquerdo possui 2.',
      ],
      layers: ['Pleura', 'Brônquios', 'Bronquíolos', 'Alvéolos Pulmonares'],
    },
    brain: {
      name: 'Cérebro (Brain)',
      system: 'Sistema Nervoso Central',
      weight: 'Aprox. 1.300g - 1.400g',
      color: '#a855f7',
      description: 'Centro de comando do corpo humano. Controla pensamentos, memória, movimentos, fala e regulação de órgãos viscerais.',
      clinicalNotes: [
        'Consome cerca de 20% do oxigênio e energia do corpo.',
        'Dividido em hemisférios esquerdo e direito.',
        'Composto por aproximadamente 86 bilhões de neurônios.',
      ],
      layers: ['Dura-máter', 'Aracnoide', 'Pia-máter', 'Córtex Cerebral'],
    },
    liver: {
      name: 'Fígado (Liver)',
      system: 'Sistema Digestório / Metabólico',
      weight: 'Aprox. 1.500g',
      color: '#eab308',
      description: 'O maior órgão interno do corpo humano. Atua na desintoxicação de metabólitos, síntese de proteínas e produção de bile.',
      clinicalNotes: [
        'Capacidade única de regeneração tecidual.',
        'Filtra cerca de 1,4 litros de sangue por minuto.',
        'Armazena glicogênio, ferro e vitaminas.',
      ],
      layers: ['Cápsula de Glisson', 'Lóbulos Hepáticos', 'Hepatócitos', 'Vias Biliares'],
    },
    kidneys: {
      name: 'Rins (Kidneys)',
      system: 'Sistema Urinário',
      weight: 'Aprox. 120g - 150g cada',
      color: '#10b981',
      description: 'Órgãos em formato de feijão responsáveis pela filtração do sangue, remoção de ureia, regulação eletrolítica e pressão arterial.',
      clinicalNotes: [
        'Filtram cerca de 180 litros de sangue diariamente.',
        'Contêm cerca de 1 milhão de néfrons funcionais.',
        'Produzem eritropoietina (estimula glóbulos vermelhos).',
      ],
      layers: ['Cortex Renal', 'Medula Renal', 'Pelve Renal', 'Néfrons'],
    },
    stomach: {
      name: 'Estômago (Stomach)',
      system: 'Sistema Digestório',
      weight: 'Aprox. 150g - 200g',
      color: '#f97316',
      description: 'Órgão muscular em forma de bolsa que atua na digestão mecânica e química dos alimentos através de sucos gástricos ácidos.',
      clinicalNotes: [
        'Capacidade de expansão de até 1,5 a 3 litros.',
        'pH interno altamente ácido (entre 1,5 e 3,5).',
        'Revestido por muco protetor contra a autodigestão.',
      ],
      layers: ['Mucosa Gástrica', 'Submucosa', 'Camada Muscular', 'Serosa'],
    },
  };

  const addNotification = (msg: string) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, msg }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3500);
  };

  // ---------------- Organ components (R3F + realistic geometry) ----------------

  const HeartMesh: React.FC<{ disassembled: boolean }> = ({ disassembled }) => {
    const groupRef = useRef<THREE.Group>(null);
    const { scene } = useGLTF('/models/realistic_human_heart/scene.gltf');

    useEffect(() => {
      if (!groupRef.current || !scene) return;
      const clone = scene.clone();
      clone.traverse((child) => {
        if (child.isMesh) {
          child.material = child.material.clone();
          child.material.needsUpdate = true;
        }
      });
      clone.scale.setScalar(0.9);
      clone.position.set(0, 0, 0);
      groupRef.current!.add(clone);
    }, [scene]);

    useFrame((state: any, delta: number) => {
      if (!groupRef.current) return;
      if (!disassembled) {
        groupRef.current.rotation.y += 0.005;
        if (selectedOrgan === 'heart') {
          const pulse = 1 + Math.sin(state.elapsedTime * (heartRate / 15)) * 0.05;
          groupRef.current.scale.set(pulse, pulse, pulse);
        } else {
          groupRef.current.scale.set(1, 1, 1);
        }
      }
    });

    return (
      <group ref={groupRef} dispose={null}>
        <pointLight position={[0, 0, 4]} intensity={1} distance={15} />
      </group>
    );
  };

  const LungsMesh: React.FC<{ disassembled: boolean }> = ({ disassembled }) => {
    const groupRef = useRef<THREE.Group>(null);
    const partsRef = useRef<Array<{ mesh: THREE.Mesh; offset: THREE.Vector3 }>>([]);
    const baseMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#3b82f6'), roughness: 0.5, metalness: 0.1 });
    const trachMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.5 });

    const rightLung = new THREE.Mesh(new THREE.SphereGeometry(1.1, 48, 48), baseMat);
    rightLung.scale.set(0.8, 1.5, 0.9);
    rightLung.position.set(1.1, 0, 0);
    partsRef.current.push({ mesh: rightLung, offset: new THREE.Vector3(2.2, 0, 0) });

    const leftLung = new THREE.Mesh(new THREE.SphereGeometry(1.1, 48, 48), baseMat);
    leftLung.scale.set(0.8, 1.5, 0.9);
    leftLung.position.set(-1.1, 0, 0);
    partsRef.current.push({ mesh: leftLung, offset: new THREE.Vector3(-2.2, 0, 0) });

    const trachea = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.6, 24), trachMat);
    trachea.position.set(0, 1.5, 0);
    partsRef.current.push({ mesh: trachea, offset: new THREE.Vector3(0, 2.7, 0) });

    useEffect(() => {
      if (!groupRef.current) return;
      groupRef.current!.add(rightLung, leftLung, trachea);
    }, []);

    useFrame((state) => {
      if (!groupRef.current) return;
      if (!disassembled) groupRef.current.rotation.y += 0.005;
      partsRef.current.forEach(({ mesh, offset }) => {
        mesh.position.lerp(new THREE.Vector3(offset.x * (disassembled ? 1 : 0), offset.y * (disassembled ? 1 : 0), offset.z * (disassembled ? 1 : 0)), 0.08);
      });
    });

    return <group ref={groupRef} />;
  };

  const BrainMesh: React.FC<{ disassembled: boolean }> = ({ disassembled }) => {
    const groupRef = useRef<THREE.Group>(null);
    const partsRef = useRef<Array<{ mesh: THREE.Mesh; offset: THREE.Vector3 }>>([]);
    const baseMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#a855f7'), roughness: 0.5, metalness: 0.1 });
    const cerebMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, roughness: 0.5 });

    const cerebrum = new THREE.Mesh(new THREE.SphereGeometry(1.3, 48, 48), baseMat);
    cerebrum.scale.set(1.3, 1.0, 1.1);
    partsRef.current.push({ mesh: cerebrum, offset: new THREE.Vector3(0, 0, 0) });

    const cerebellum = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), cerebMat);
    cerebellum.position.set(0, -0.8, -0.9);
    partsRef.current.push({ mesh: cerebellum, offset: new THREE.Vector3(0, -1.4, -2.0) });

    useEffect(() => {
      if (!groupRef.current) return;
      groupRef.current!.add(cerebrum, cerebellum);
    }, []);

    useFrame((state) => {
      if (!groupRef.current) return;
      if (!disassembled) groupRef.current.rotation.y += 0.005;
      partsRef.current.forEach(({ mesh, offset }) => {
        mesh.position.lerp(new THREE.Vector3(offset.x * (disassembled ? 1 : 0), offset.y * (disassembled ? 1 : 0), offset.z * (disassembled ? 1 : 0)), 0.08);
      });
    });

    return <group ref={groupRef} />;
  };

  const LiverMesh: React.FC<{ disassembled: boolean }> = ({ disassembled }) => {
    const groupRef = useRef<THREE.Group>(null);
    const partsRef = useRef<Array<{ mesh: THREE.Mesh; offset: THREE.Vector3 }>>([]);
    const baseMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#eab308'), roughness: 0.5, metalness: 0.1 });
    const gbMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 });

    const liver = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.3, 1.5), baseMat);
    liver.rotation.y = 0.3;
    partsRef.current.push({ mesh: liver, offset: new THREE.Vector3(0, 0, 0) });

    const gallBladder = new THREE.Mesh(new THREE.SphereGeometry(0.35, 24, 24), gbMat);
    gallBladder.position.set(0.6, -0.8, 0.4);
    partsRef.current.push({ mesh: gallBladder, offset: new THREE.Vector3(1.4, -1.7, 0.9) });

    useEffect(() => {
      if (!groupRef.current) return;
      groupRef.current!.add(liver, gallBladder);
    }, []);

    useFrame((state) => {
      if (!groupRef.current) return;
      if (!disassembled) groupRef.current.rotation.y += 0.005;
      partsRef.current.forEach(({ mesh, offset }) => {
        mesh.position.lerp(new THREE.Vector3(offset.x * (disassembled ? 1 : 0), offset.y * (disassembled ? 1 : 0), offset.z * (disassembled ? 1 : 0)), 0.08);
      });
    });

    return <group ref={groupRef} />;
  };

  const KidneysMesh: React.FC<{ disassembled: boolean }> = ({ disassembled }) => {
    const groupRef = useRef<THREE.Group>(null);
    const partsRef = useRef<Array<{ mesh: THREE.Mesh; offset: THREE.Vector3 }>>([]);
    const baseMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#10b981'), roughness: 0.5, metalness: 0.1 });

    const rKidney = new THREE.Mesh(new THREE.CapsuleGeometry(0.6, 1.2, 24, 32), baseMat);
    rKidney.rotation.z = -0.2;
    rKidney.position.set(1.1, 0, 0);
    partsRef.current.push({ mesh: rKidney, offset: new THREE.Vector3(2.4, 0, 0) });

    const lKidney = new THREE.Mesh(new THREE.CapsuleGeometry(0.6, 1.2, 24, 32), baseMat);
    lKidney.rotation.z = 0.2;
    lKidney.position.set(-1.1, 0, 0);
    partsRef.current.push({ mesh: lKidney, offset: new THREE.Vector3(-2.4, 0, 0) });

    useEffect(() => {
      if (!groupRef.current) return;
      groupRef.current!.add(rKidney, lKidney);
    }, []);

    useFrame((state) => {
      if (!groupRef.current) return;
      if (!disassembled) groupRef.current.rotation.y += 0.005;
      partsRef.current.forEach(({ mesh, offset }) => {
        mesh.position.lerp(new THREE.Vector3(offset.x * (disassembled ? 1 : 0), offset.y * (disassembled ? 1 : 0), offset.z * (disassembled ? 1 : 0)), 0.08);
      });
    });

    return <group ref={groupRef} />;
  };

  const StomachMesh: React.FC<{ disassembled: boolean }> = ({ disassembled }) => {
    const groupRef = useRef<THREE.Group>(null);
    const partsRef = useRef<Array<{ mesh: THREE.Mesh; offset: THREE.Vector3 }>>([]);
    const baseMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#f97316'), roughness: 0.5, metalness: 0.1 });

    const stom = new THREE.Mesh(new THREE.SphereGeometry(1.2, 48, 48), baseMat);
    stom.scale.set(1.2, 1.0, 0.9);
    stom.rotation.z = 0.5;
    partsRef.current.push({ mesh: stom, offset: new THREE.Vector3(0, 0, 0) });

    useEffect(() => {
      if (!groupRef.current) return;
      groupRef.current!.add(stom);
    }, []);

    useFrame((state) => {
      if (!groupRef.current) return;
      if (!disassembled) groupRef.current.rotation.y += 0.005;
      partsRef.current.forEach(({ mesh, offset }) => {
        mesh.position.lerp(new THREE.Vector3(offset.x * (disassembled ? 1 : 0), offset.y * (disassembled ? 1 : 0), offset.z * (disassembled ? 1 : 0)), 0.08);
      });
    });

    return <group ref={groupRef} />;
  };

  const Organ3D: React.FC<{ disassembled: boolean }> = ({ disassembled }) => {
    switch (selectedOrgan) {
      case 'heart': return <HeartMesh disassembled={disassembled} />;
      case 'lungs': return <LungsMesh disassembled={disassembled} />;
      case 'brain': return <BrainMesh disassembled={disassembled} />;
      case 'liver': return <LiverMesh disassembled={disassembled} />;
      case 'kidneys': return <KidneysMesh disassembled={disassembled} />;
      case 'stomach': return <StomachMesh disassembled={disassembled} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Toast Notifications */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {notifications.map((n) => (
          <div key={n.id} className="bg-slate-900/90 border border-cyan-500/50 text-cyan-300 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md animate-fade-in flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <p className="text-sm font-medium">{n.msg}</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur-xl sticky top-0 z-40 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <svg className="w-6 h-6 text-slate-950 font-bold" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              BioNexus 3D • Anatomia Humana
            </h1>
            <p className="text-xs text-slate-400">Simulador Clínico Interativo • React Three Fiber & Drei</p>
          </div>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => { setActiveTab('explorer'); addNotification('Modo Explorador 3D ativado'); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'explorer' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            Explorador 3D
          </button>
          <button
            onClick={() => { setActiveTab('stats'); addNotification('Painel de Sinais Vitais aberto'); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'stats' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            Sinais Vitais
          </button>
          <button
            onClick={() => { setActiveTab('simulator'); addNotification('Modo Desmontagem Teardown ativado'); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'simulator' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            Teardown de Camadas
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row p-6 gap-6 max-w-7xl mx-auto w-full">
        {/* Left Column */}
        <div className="w-full lg:w-96 flex flex-col gap-6">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl backdrop-blur-md shadow-xl">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Selecione o Órgão</span>
              <span className="text-xs text-cyan-400 normal-case bg-cyan-950/50 border border-cyan-800/50 px-2 py-0.5 rounded-full">6 Órgãos</span>
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(organsData).map(([key, organ]) => {
                const isSelected = selectedOrgan === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedOrgan(key as keyof typeof organsData);
                      setDisassembled(false);
                      addNotification(`Carregando modelo: ${organ.name}`);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 group relative overflow-hidden ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none"></div>
                    <div className="flex items-center justify-between">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: organ.color }}></span>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">{key}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-200 group-hover:text-cyan-300 transition-colors">{organ.name.split(' ')[0]}</h3>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl backdrop-blur-md shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2.5 py-1 rounded-md">
                  {organsData[selectedOrgan].system}
                </span>
                <span className="text-xs text-slate-400 font-medium">{organsData[selectedOrgan].weight}</span>
              </div>
              <h3 className="text-xl font-extrabold text-white mb-2">{organsData[selectedOrgan].name}</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">{organsData[selectedOrgan].description}</p>
              <div className="space-y-3 mb-6">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Notas Clínicas & Fisiologia</h4>
                {organsData[selectedOrgan].clinicalNotes.map((note, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                    <span className="text-cyan-400 font-bold mt-0.5">•</span>
                    <p className="leading-normal">{note}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Status: <strong className="text-emerald-400">Estável / Saudável</strong></span>
              <span className="font-mono text-cyan-400">ID: {selectedOrgan.toUpperCase()}-09A</span>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Viewport */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md shadow-xl flex-1 flex flex-col relative overflow-hidden min-h-[500px]">
            <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
              <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800/80 px-4 py-2 rounded-xl flex items-center gap-3 pointer-events-auto shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-mono text-slate-300">Simulação 3D Ativa (React Three Fiber)</span>
              </div>
              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  onClick={() => {
                    setDisassembled(!disassembled);
                    addNotification(disassembled ? 'Montando estruturas anatômicas...' : 'Desmontando camadas (Teardown Mode)...');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-lg flex items-center gap-2 ${
                    disassembled ? 'bg-amber-500 text-slate-950 shadow-amber-500/20' : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  {!disassembled ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 1l-5-5m5 5v-4m0-4h-4"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-slate-950" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2V10m0 0v10M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  )}
                  {disassembled ? 'Montar Órgão' : 'Desmontar (Teardown)'}
                </button>
              </div>
            </div>

            {/* React Three Fiber Canvas */}
            <div className="w-full flex-1 cursor-grab active:cursor-grabbing h-full">
              <Canvas
                camera={{ position: [0, 0, 7], fov: 50 }}
                shadows
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                style={{ width: '100%', height: '100%', display: 'block' }}
              >
                <ambientLight intensity={0.7} />
                <directionalLight position={[5, 10, 7]} intensity={1.2} />
                <pointLight position={[-5, -5, -5]} intensity={2} color="#38bdf8" distance={50} />
                <Environment preset="city" intensity={0.3} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <OrbitControls enableZoom enablePan makeDefault />
                <Suspense fallback={null}>
                  <Organ3D disassembled={disassembled} />
                </Suspense>
              </Canvas>
            </div>

            <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 p-4 rounded-xl shadow-lg pointer-events-auto">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Velocidade de Rotação:</span>
                <input
                  type="range"
                  min="0"
                  max="0.02"
                  step="0.001"
                  value={rotationSpeed}
                  onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                  className="accent-cyan-500 w-full md:w-32 cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Camadas:</span>
                {organsData[selectedOrgan].layers.map((layer, idx) => (
                  <span
                    key={idx}
                    onClick={() => addNotification(`Inspecionando camada: ${layer}`)}
                    className="text-[11px] bg-slate-900 border border-slate-700/80 text-cyan-300 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-cyan-500/10 hover:border-cyan-500 transition-all whitespace-nowrap"
                  >
                    {layer}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {activeTab === 'stats' && (
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-md shadow-xl animate-fade-in">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Monitoramento Fisiológico em Tempo Real</span>
                <span className="text-xs text-emerald-400 font-mono">Telemetria Ativa</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Batimento Cardíaco</span>
                    <span className="text-xs font-mono text-rose-400 font-bold bg-rose-950/50 px-2 py-0.5 rounded border border-rose-900/50">BPM</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white font-mono">{heartRate}</span>
                    <span className="text-xs text-slate-500">batimentos / min</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="140"
                    value={heartRate}
                    onChange={(e) => setHeartRate(parseInt(e.target.value))}
                    className="accent-rose-500 cursor-pointer"
                  />
                </div>
                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Temperatura Corporal</span>
                    <span className="text-xs font-mono text-amber-400 font-bold bg-amber-950/50 px-2 py-0.5 rounded border border-amber-900/50">°C</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white font-mono">{bodyTemp}</span>
                    <span className="text-xs text-slate-500">Celsius</span>
                  </div>
                  <input
                    type="range"
                    min="35.0"
                    max="40.0"
                    step="0.1"
                    value={bodyTemp}
                    onChange={(e) => setBodyTemp(parseFloat(e.target.value))}
                    className="accent-amber-500 cursor-pointer"
                  />
                </div>
                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Saturação de Oxigênio</span>
                    <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-900/50">SpO2</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white font-mono">{oxygenLevel}%</span>
                    <span className="text-xs text-slate-500">Oxigenação</span>
                  </div>
                  <input
                    type="range"
                    min="85"
                    max="100"
                    value={oxygenLevel}
                    onChange={(e) => setOxygenLevel(parseInt(e.target.value))}
                    className="accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-slate-800/80 bg-slate-900/40 py-4 px-6 text-center text-xs text-slate-500">
        <p>BioNexus 3D Anatomy Explorer • Construído com React, React Three Fiber, Drei, Tailwind CSS e Three.js</p>
      </footer>
    </div>
  );
}
