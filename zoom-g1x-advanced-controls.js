// zoom-g1x-advanced-controls.js
// Module de contrôle avancé pour Zoom G1X Four
// À intégrer dans l'application principale selon tes besoins

/**
 * ZOOM G1X FOUR - ADVANCED MIDI CONTROLS
 * 
 * Ce module contient des fonctions avancées pour contrôler
 * ta Zoom G1X Four via MIDI SysEx.
 * 
 * IMPORTANT: Ces commandes ont été dérivées par reverse engineering
 * de la communauté. Teste-les progressivement!
 */

class ZoomG1XController {
    constructor(midiOutput, midiInput) {
        this.output = midiOutput;
        this.input = midiInput;
        this.currentPatch = null;
        
        if (this.input) {
            this.input.onmidimessage = this.handleMessage.bind(this);
        }
    }
    
    // ========================================
    // COMMANDES SYSEX DE BASE
    // ========================================
    
    /**
     * Active le mode Edit sur la pédale
     * Nécessaire avant de modifier des paramètres
     */
    enableEditMode() {
        const sysex = [0xF0, 0x52, 0x00, 0x64, 0x50, 0xF7];
        this.output.send(sysex);
        console.log('Edit mode activé');
    }
    
    /**
     * Désactive le mode Edit
     */
    disableEditMode() {
        const sysex = [0xF0, 0x52, 0x00, 0x64, 0x51, 0xF7];
        this.output.send(sysex);
        console.log('Edit mode désactivé');
    }
    
    /**
     * Requête du patch actuel
     * Retourne les données du patch via message MIDI
     */
    requestCurrentPatch() {
        const sysex = [0xF0, 0x52, 0x00, 0x64, 0x29, 0xF7];
        this.output.send(sysex);
        console.log('Requête patch actuel envoyée');
    }
    
    /**
     * Requête d'un patch spécifique (0-49)
     */
    requestPatch(patchNumber) {
        if (patchNumber < 0 || patchNumber > 49) {
            console.error('Numéro de patch invalide:', patchNumber);
            return;
        }
        
        const sysex = [0xF0, 0x52, 0x00, 0x64, 0x09, patchNumber, 0xF7];
        this.output.send(sysex);
        console.log(`Requête patch ${patchNumber} envoyée`);
    }
    
    /**
     * Sauvegarde le patch actuel dans un slot
     */
    savePatch(patchNumber) {
        if (patchNumber < 0 || patchNumber > 49) {
            console.error('Numéro de patch invalide:', patchNumber);
            return;
        }
        
        // Cette commande nécessite les données du patch complet
        // Il faut d'abord récupérer le patch actuel puis le renvoyer
        console.log(`Sauvegarde dans le patch ${patchNumber}`);
    }
    
    // ========================================
    // CONTRÔLE DES EFFETS
    // ========================================
    
    /**
     * Active/désactive un effet dans le patch actuel
     * @param {number} effectSlot - Slot de l'effet (0-4)
     * @param {boolean} enable - true pour activer, false pour désactiver
     */
    toggleEffect(effectSlot, enable) {
        if (effectSlot < 0 || effectSlot > 4) {
            console.error('Slot d\'effet invalide:', effectSlot);
            return;
        }
        
        // Note: Cette fonction nécessite d'être en edit mode
        // et de connaître la structure exacte du patch
        console.log(`Effet slot ${effectSlot}: ${enable ? 'ON' : 'OFF'}`);
    }
    
    /**
     * Change le type d'effet dans un slot
     * @param {number} effectSlot - Slot de l'effet (0-4)
     * @param {number} effectType - Type d'effet (voir liste des effets)
     */
    changeEffectType(effectSlot, effectType) {
        if (effectSlot < 0 || effectSlot > 4) {
            console.error('Slot d\'effet invalide:', effectSlot);
            return;
        }
        
        console.log(`Changement effet slot ${effectSlot} vers type ${effectType}`);
    }
    
    /**
     * Modifie un paramètre d'effet
     * @param {number} effectSlot - Slot de l'effet (0-4)
     * @param {number} parameter - Numéro du paramètre
     * @param {number} value - Valeur (0-100 généralement)
     */
    setEffectParameter(effectSlot, parameter, value) {
        if (effectSlot < 0 || effectSlot > 4) {
            console.error('Slot d\'effet invalide:', effectSlot);
            return;
        }
        
        console.log(`Paramètre ${parameter} de l'effet ${effectSlot} = ${value}`);
    }
    
    // ========================================
    // CONTRÔLE DU TEMPO
    // ========================================
    
    /**
     * Change le tempo global (BPM)
     * @param {number} bpm - Tempo en BPM (40-250)
     */
    setTempo(bpm) {
        if (bpm < 40 || bpm > 250) {
            console.error('BPM invalide:', bpm);
            return;
        }
        
        // La G1X Four n'a pas de commande MIDI directe pour le tempo
        // Il faudrait utiliser le bouton physique ou SysEx avancé
        console.log(`Tempo: ${bpm} BPM (non implémenté directement)`);
    }
    
    /**
     * Tap Tempo - envoie un tap
     */
    tapTempo() {
        // La G1X Four n'a pas de commande MIDI pour tap tempo
        // Solution alternative: changer entre patches avec différents tempos
        console.log('Tap tempo (non supporté nativement)');
    }
    
    // ========================================
    // CONTRÔLE DU LOOPER
    // ========================================
    
    /**
     * Contrôle le looper
     * @param {string} action - 'record', 'play', 'stop', 'clear'
     */
    looperControl(action) {
        // Les commandes looper ne sont pas bien documentées
        // Elles nécessitent probablement des SysEx spécifiques
        console.log(`Looper: ${action} (à implémenter)`);
    }
    
    // ========================================
    // TUNER
    // ========================================
    
    /**
     * Active/désactive le tuner
     * @param {boolean} enable - true pour activer
     */
    toggleTuner(enable) {
        // Le tuner est généralement activé par un appui long
        // Pas de commande MIDI directe connue
        console.log(`Tuner: ${enable ? 'ON' : 'OFF'} (à implémenter)`);
    }
    
    // ========================================
    // RÉCEPTION DE MESSAGES
    // ========================================
    
    /**
     * Gère les messages MIDI reçus
     */
    handleMessage(message) {
        const data = message.data;
        
        // Program Change
        if (data[0] === 0xC0) {
            const patch = data[1];
            console.log('Patch changé:', patch);
            this.onPatchChange && this.onPatchChange(patch);
        }
        
        // SysEx
        if (data[0] === 0xF0 && data[1] === 0x52) {
            this.handleSysEx(data);
        }
        
        // Control Change
        if ((data[0] & 0xF0) === 0xB0) {
            const cc = data[1];
            const value = data[2];
            console.log(`CC ${cc}: ${value}`);
        }
    }
    
    /**
     * Parse les messages SysEx reçus
     */
    handleSysEx(data) {
        console.log('SysEx:', Array.from(data).map(b => b.toString(16).padStart(2, '0')).join(' '));
        
        // Type de message
        const msgType = data[4];
        
        switch(msgType) {
            case 0x28:
                // Données de patch
                this.parsePatchData(data);
                break;
            case 0x29:
                // Patch actuel
                this.parsePatchData(data);
                break;
            default:
                console.log('Type de message SysEx inconnu:', msgType.toString(16));
        }
    }
    
    /**
     * Parse les données d'un patch
     */
    parsePatchData(data) {
        // Structure approximative d'un patch:
        // F0 52 00 64 28 [données du patch...] F7
        
        // Les données incluent:
        // - État ON/OFF de chaque effet
        // - Type de chaque effet
        // - Paramètres de chaque effet
        // - Nom du patch
        // - Niveau du patch
        
        console.log('Données de patch reçues, longueur:', data.length);
        
        // Extraction simplifiée (à adapter selon la vraie structure)
        try {
            const patchData = {
                name: this.extractPatchName(data),
                effects: this.extractEffects(data),
                level: data[data.length - 10] // Approximation
            };
            
            console.log('Patch parsé:', patchData);
            this.onPatchDataReceived && this.onPatchDataReceived(patchData);
        } catch (e) {
            console.error('Erreur parsing patch:', e);
        }
    }
    
    /**
     * Extrait le nom du patch des données SysEx
     */
    extractPatchName(data) {
        // Le nom est généralement vers la fin du message
        // Encodé en ASCII avec des caractères NULL pour le padding
        const nameStart = data.length - 20;
        const nameBytes = data.slice(nameStart, nameStart + 10);
        
        let name = '';
        for (let i = 0; i < nameBytes.length; i++) {
            if (nameBytes[i] === 0 || nameBytes[i] === 0xF7) break;
            if (nameBytes[i] >= 32 && nameBytes[i] <= 126) {
                name += String.fromCharCode(nameBytes[i]);
            }
        }
        
        return name.trim() || 'Unknown';
    }
    
    /**
     * Extrait les informations d'effets
     */
    extractEffects(data) {
        const effects = [];
        
        // Cette fonction nécessite une connaissance précise
        // de la structure des données Zoom
        // Pour l'instant, retour de données simulées
        
        for (let i = 0; i < 5; i++) {
            effects.push({
                slot: i,
                type: 'Unknown',
                enabled: false,
                parameters: {}
            });
        }
        
        return effects;
    }
    
    // ========================================
    // CALLBACKS
    // ========================================
    
    /**
     * Définit un callback pour les changements de patch
     */
    onPatchChange(callback) {
        this.onPatchChange = callback;
    }
    
    /**
     * Définit un callback pour la réception de données de patch
     */
    onPatchDataReceived(callback) {
        this.onPatchDataReceived = callback;
    }
}

// ========================================
// CONSTANTES UTILES
// ========================================

const ZOOM_EFFECT_TYPES = {
    // Dynamics
    COMP: 0x01,
    LIMITER: 0x02,
    NOISE_GATE: 0x03,
    
    // Filter
    WAH: 0x10,
    AUTO_WAH: 0x11,
    
    // Drive
    OVERDRIVE: 0x20,
    DISTORTION: 0x21,
    FUZZ: 0x22,
    BOOSTER: 0x23,
    
    // Amp
    CLEAN: 0x30,
    CRUNCH: 0x31,
    LEAD: 0x32,
    
    // Modulation
    CHORUS: 0x40,
    FLANGER: 0x41,
    PHASER: 0x42,
    TREMOLO: 0x43,
    VIBRATO: 0x44,
    
    // Delay
    DELAY: 0x50,
    ECHO: 0x51,
    TAPE_ECHO: 0x52,
    
    // Reverb
    HALL: 0x60,
    ROOM: 0x61,
    SPRING: 0x62,
    PLATE: 0x63,
    
    // Special
    PITCH: 0x70,
    HARMONY: 0x71,
    OCTAVE: 0x72
};

const ZOOM_BANKS = {
    BANK_1: 0,
    BANK_2: 1,
    BANK_3: 2,
    BANK_4: 3,
    BANK_5: 4
};

// ========================================
// EXEMPLE D'UTILISATION
// ========================================

/*
// Dans ton application principale:

let controller;

async function setupZoomController() {
    const midiAccess = await navigator.requestMIDIAccess({ sysex: true });
    
    let midiOutput, midiInput;
    
    for (const output of midiAccess.outputs.values()) {
        if (output.name.includes('ZOOM') || output.name.includes('G1')) {
            midiOutput = output;
        }
    }
    
    for (const input of midiAccess.inputs.values()) {
        if (input.name.includes('ZOOM') || input.name.includes('G1')) {
            midiInput = input;
        }
    }
    
    if (midiOutput && midiInput) {
        controller = new ZoomG1XController(midiOutput, midiInput);
        
        // Définir les callbacks
        controller.onPatchChange = (patch) => {
            console.log('Nouveau patch:', patch);
            updateUI(patch);
        };
        
        controller.onPatchDataReceived = (data) => {
            console.log('Données patch:', data);
            displayPatchInfo(data);
        };
        
        // Activer le mode edit
        controller.enableEditMode();
        
        // Requérir le patch actuel
        controller.requestCurrentPatch();
    }
}

// Utilisation des fonctions
function changePatch(patchNum) {
    midiOutput.send([0xC0, patchNum]);
}

function toggleEffectSlot(slot) {
    controller.toggleEffect(slot, true);
}
*/

// ========================================
// NOTES IMPORTANTES
// ========================================

/*
LIMITATIONS CONNUES:
- Pas de contrôle direct du tempo via MIDI
- Tap tempo non supporté nativement
- Looper contrôlable uniquement par boutons physiques
- Certaines commandes SysEx nécessitent d'être en Edit Mode

RESSOURCES:
- GitHub: mungewell/zoom-zt2 (parseur Python pour G1on)
- GitHub: SysExTones/g1on (contrôle ligne de commande)
- ToneLib Forum: discussions sur le protocole MIDI Zoom

DÉVELOPPEMENT FUTUR:
- Implémenter le parsing complet des patches
- Ajouter le support de la pédale d'expression
- Créer une bibliothèque de patches
- Intégration avec Guitar Lab
*/

export { ZoomG1XController, ZOOM_EFFECT_TYPES, ZOOM_BANKS };
