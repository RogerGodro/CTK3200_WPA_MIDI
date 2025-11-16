import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Power } from 'lucide-react';

const MonotronSynth = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPoweredOn, setIsPoweredOn] = useState(false);
  
  // Oscillator parameters
  const [osc1Wave, setOsc1Wave] = useState('sawtooth');
  const [osc2Wave, setOsc2Wave] = useState('square');
  const [osc1Pitch, setOsc1Pitch] = useState(0);
  const [osc2Pitch, setOsc2Pitch] = useState(-12);
  const [osc2Mix, setOsc2Mix] = useState(0.5);
  
  // Filter parameters
  const [cutoff, setCutoff] = useState(2000);
  const [resonance, setResonance] = useState(1);
  const [peak, setPeak] = useState(0);
  
  // LFO parameters
  const [lfoRate, setLfoRate] = useState(5);
  const [lfoDepth, setLfoDepth] = useState(0);
  const [lfoTarget, setLfoTarget] = useState('pitch');
  
  // Master volume
  const [volume, setVolume] = useState(0.5);
  
  // Audio context refs
  const audioContextRef = useRef(null);
  const osc1Ref = useRef(null);
  const osc2Ref = useRef(null);
  const filterRef = useRef(null);
  const lfoRef = useRef(null);
  const lfoGainRef = useRef(null);
  const gainNodeRef = useRef(null);
  const masterGainRef = useRef(null);
  
  // Initialize audio context
  useEffect(() => {
    if (isPoweredOn && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [isPoweredOn]);
  
  const startNote = (frequency) => {
    if (!isPoweredOn || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    
    // Stop existing oscillators
    stopNote();
    
    // Create oscillators
    osc1Ref.current = ctx.createOscillator();
    osc2Ref.current = ctx.createOscillator();
    
    // Create filter
    filterRef.current = ctx.createBiquadFilter();
    filterRef.current.type = 'lowpass';
    filterRef.current.frequency.value = cutoff + (peak * 1000);
    filterRef.current.Q.value = resonance;
    
    // Create LFO
    lfoRef.current = ctx.createOscillator();
    lfoRef.current.frequency.value = lfoRate;
    lfoGainRef.current = ctx.createGain();
    lfoGainRef.current.gain.value = lfoDepth;
    
    // Create gain nodes
    const osc1Gain = ctx.createGain();
    const osc2Gain = ctx.createGain();
    gainNodeRef.current = ctx.createGain();
    masterGainRef.current = ctx.createGain();
    
    // Set oscillator parameters
    osc1Ref.current.type = osc1Wave;
    osc2Ref.current.type = osc2Wave;
    osc1Ref.current.frequency.value = frequency * Math.pow(2, osc1Pitch / 12);
    osc2Ref.current.frequency.value = frequency * Math.pow(2, osc2Pitch / 12);
    
    // Set mix levels
    osc1Gain.gain.value = 1 - osc2Mix;
    osc2Gain.gain.value = osc2Mix;
    gainNodeRef.current.gain.value = 0.3;
    masterGainRef.current.gain.value = volume;
    
    // Connect LFO
    lfoRef.current.connect(lfoGainRef.current);
    
    if (lfoTarget === 'pitch') {
      lfoGainRef.current.connect(osc1Ref.current.frequency);
      lfoGainRef.current.connect(osc2Ref.current.frequency);
    } else if (lfoTarget === 'filter') {
      lfoGainRef.current.connect(filterRef.current.frequency);
    }
    
    // Connect audio graph
    osc1Ref.current.connect(osc1Gain);
    osc2Ref.current.connect(osc2Gain);
    osc1Gain.connect(gainNodeRef.current);
    osc2Gain.connect(gainNodeRef.current);
    gainNodeRef.current.connect(filterRef.current);
    filterRef.current.connect(masterGainRef.current);
    masterGainRef.current.connect(ctx.destination);
    
    // Start oscillators
    osc1Ref.current.start();
    osc2Ref.current.start();
    lfoRef.current.start();
    
    setIsPlaying(true);
  };
  
  const stopNote = () => {
    if (osc1Ref.current) {
      osc1Ref.current.stop();
      osc1Ref.current = null;
    }
    if (osc2Ref.current) {
      osc2Ref.current.stop();
      osc2Ref.current = null;
    }
    if (lfoRef.current) {
      lfoRef.current.stop();
      lfoRef.current = null;
    }
    setIsPlaying(false);
  };
  
  const updateFilter = () => {
    if (filterRef.current) {
      filterRef.current.frequency.value = cutoff + (peak * 1000);
      filterRef.current.Q.value = resonance;
    }
  };
  
  const updateLFO = () => {
    if (lfoRef.current) {
      lfoRef.current.frequency.value = lfoRate;
    }
    if (lfoGainRef.current) {
      lfoGainRef.current.gain.value = lfoDepth;
    }
  };
  
  const updateVolume = () => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = volume;
    }
  };
  
  useEffect(() => {
    updateFilter();
  }, [cutoff, resonance, peak]);
  
  useEffect(() => {
    updateLFO();
  }, [lfoRate, lfoDepth]);
  
  useEffect(() => {
    updateVolume();
  }, [volume]);
  
  const handleRibbonTouch = (e) => {
    if (!isPoweredOn) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const ratio = x / rect.width;
    
    // Map to frequency range (C2 to C6)
    const minFreq = 65.41; // C2
    const maxFreq = 1046.5; // C6
    const frequency = minFreq * Math.pow(maxFreq / minFreq, ratio);
    
    startNote(frequency);
  };
  
  const handleRibbonRelease = () => {
    stopNote();
  };
  
  const Knob = ({ label, value, onChange, min, max, step = 1, unit = '' }) => {
    const percentage = ((value - min) / (max - min)) * 100;
    const rotation = (percentage * 2.7) - 135; // -135° to +135°
    
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full bg-gray-800 border-2 border-gray-600 shadow-inner" />
          <div 
            className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg cursor-pointer"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <div className="absolute top-1 left-1/2 w-1 h-4 bg-white rounded-full -translate-x-1/2" />
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
        <div className="text-xs text-blue-200 font-mono text-center">
          {label}
          <div className="text-white">{value}{unit}</div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-gradient-to-br from-blue-900 to-blue-800 rounded-3xl shadow-2xl p-8 border-4 border-blue-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-wider">MONOTRON</h1>
            <p className="text-blue-200 text-sm">DUO SYNTH</p>
          </div>
          <button
            onClick={() => setIsPoweredOn(!isPoweredOn)}
            className={`p-4 rounded-full ${isPoweredOn ? 'bg-green-500' : 'bg-red-500'} shadow-lg hover:scale-110 transition-transform`}
          >
            <Power className="w-6 h-6 text-white" />
          </button>
        </div>
        
        {/* Ribbon Controller */}
        <div className="mb-8">
          <div className="text-white text-sm mb-2 text-center">RIBBON CONTROLLER</div>
          <div
            className={`h-24 rounded-lg ${isPoweredOn ? 'bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500' : 'bg-gray-600'} shadow-inner cursor-pointer relative overflow-hidden`}
            onMouseDown={handleRibbonTouch}
            onMouseMove={(e) => e.buttons === 1 && handleRibbonTouch(e)}
            onMouseUp={handleRibbonRelease}
            onMouseLeave={handleRibbonRelease}
            onTouchStart={handleRibbonTouch}
            onTouchMove={handleRibbonTouch}
            onTouchEnd={handleRibbonRelease}
          >
            {isPoweredOn && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold opacity-50">
                TOUCH TO PLAY
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
            )}
          </div>
        </div>
        
        {/* Oscillator Section */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-950 bg-opacity-50 rounded-lg p-4">
            <h3 className="text-white text-sm mb-3 text-center border-b border-blue-500 pb-2">VCO 1</h3>
            <div className="space-y-3">
              <div>
                <label className="text-blue-200 text-xs block mb-1">Waveform</label>
                <select 
                  value={osc1Wave} 
                  onChange={(e) => setOsc1Wave(e.target.value)}
                  className="w-full bg-blue-900 text-white rounded px-2 py-1 text-sm"
                  disabled={!isPoweredOn}
                >
                  <option value="sine">Sine</option>
                  <option value="sawtooth">Sawtooth</option>
                  <option value="square">Square</option>
                  <option value="triangle">Triangle</option>
                </select>
              </div>
              <Knob label="PITCH" value={osc1Pitch} onChange={setOsc1Pitch} min={-24} max={24} step={1} />
            </div>
          </div>
          
          <div className="bg-blue-950 bg-opacity-50 rounded-lg p-4">
            <h3 className="text-white text-sm mb-3 text-center border-b border-blue-500 pb-2">VCO 2</h3>
            <div className="space-y-3">
              <div>
                <label className="text-blue-200 text-xs block mb-1">Waveform</label>
                <select 
                  value={osc2Wave} 
                  onChange={(e) => setOsc2Wave(e.target.value)}
                  className="w-full bg-blue-900 text-white rounded px-2 py-1 text-sm"
                  disabled={!isPoweredOn}
                >
                  <option value="sine">Sine</option>
                  <option value="sawtooth">Sawtooth</option>
                  <option value="square">Square</option>
                  <option value="triangle">Triangle</option>
                </select>
              </div>
              <Knob label="PITCH" value={osc2Pitch} onChange={setOsc2Pitch} min={-24} max={24} step={1} />
              <Knob label="MIX" value={osc2Mix} onChange={setOsc2Mix} min={0} max={1} step={0.01} />
            </div>
          </div>
        </div>
        
        {/* Filter Section */}
        <div className="bg-blue-950 bg-opacity-50 rounded-lg p-4 mb-6">
          <h3 className="text-white text-sm mb-3 text-center border-b border-blue-500 pb-2">VCF (MS-20 FILTER)</h3>
          <div className="flex justify-around items-start">
            <Knob label="CUTOFF" value={cutoff} onChange={setCutoff} min={50} max={8000} step={10} unit="Hz" />
            <Knob label="PEAK" value={peak} onChange={setPeak} min={0} max={5} step={0.1} />
            <Knob label="RES" value={resonance} onChange={setResonance} min={0.1} max={30} step={0.1} />
          </div>
        </div>
        
        {/* LFO Section */}
        <div className="bg-blue-950 bg-opacity-50 rounded-lg p-4 mb-6">
          <h3 className="text-white text-sm mb-3 text-center border-b border-blue-500 pb-2">LFO</h3>
          <div className="flex justify-around items-start">
            <Knob label="RATE" value={lfoRate} onChange={setLfoRate} min={0.1} max={20} step={0.1} unit="Hz" />
            <Knob label="DEPTH" value={lfoDepth} onChange={setLfoDepth} min={0} max={100} step={1} />
            <div className="flex flex-col items-center gap-1">
              <div className="text-xs text-blue-200 mb-1">TARGET</div>
              <select 
                value={lfoTarget} 
                onChange={(e) => setLfoTarget(e.target.value)}
                className="bg-blue-900 text-white rounded px-3 py-2 text-sm"
                disabled={!isPoweredOn}
              >
                <option value="pitch">Pitch</option>
                <option value="filter">Filter</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Master Volume */}
        <div className="bg-blue-950 bg-opacity-50 rounded-lg p-4">
          <div className="flex items-center justify-center gap-4">
            <Volume2 className="text-blue-200 w-6 h-6" />
            <div className="flex-1">
              <Knob label="VOLUME" value={volume} onChange={setVolume} min={0} max={1} step={0.01} />
            </div>
          </div>
        </div>
        
        {/* Status */}
        <div className="mt-4 text-center">
          <div className={`inline-block px-4 py-2 rounded-full ${isPoweredOn ? 'bg-green-500' : 'bg-gray-500'}`}>
            <span className="text-white text-sm font-bold">
              {isPoweredOn ? (isPlaying ? '♪ PLAYING' : 'READY') : 'OFF'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonotronSynth;
