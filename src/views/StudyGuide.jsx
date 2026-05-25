import React, { useState } from 'react';

const UNITS = [
  { id: 'unit1', label: 'Unit 1: Diodes' },
  { id: 'unit2', label: 'Unit 2: Transistors' },
  { id: 'unit3', label: 'Unit 3: FET & MOSFET' },
  { id: 'unit4', label: 'Unit 4: Digital & Logic' },
  { id: 'unit5', label: 'Unit 5: Flip-Flops & Counters' },
];

const UNIT1_CARDS = [
  {
    freq: 'high',
    freqLabel: '🔴 High Frequency — 4/5 years',
    marks: '10 Marks',
    part: 'Part B',
    question: 'Explain the operation of a Bridge / Full Wave Rectifier with circuit diagram and waveforms.',
    answer: (
      <div className="sg-ans-text">
        <strong>Definition:</strong> A rectifier converts AC supply into unidirectional (DC) output.<br /><br />
        <strong>Bridge Rectifier Circuit:</strong> Uses 4 diodes (D1, D2, D3, D4) connected in a bridge configuration with the AC input across one pair of junctions and the load RL across the other pair.<br /><br />
        <strong>Working (Positive Half Cycle):</strong> During the positive half cycle of AC input, diodes D1 and D3 are forward biased and conduct, while D2 and D4 are reverse biased. Current flows through D1 → Load RL → D3.<br /><br />
        <strong>Working (Negative Half Cycle):</strong> During the negative half cycle, diodes D2 and D4 conduct, while D1 and D3 are cut off. Current flows through D2 → Load RL → D4.<br /><br />
        <strong>Key Point:</strong> In both half cycles, current through the load flows in the same direction — giving pulsating DC output.<br /><br />
        <strong>Important Formulas:</strong>
        <ul>
          <li>Average output voltage: Vdc = 2Vm/π ≈ 0.636 Vm</li>
          <li>RMS voltage: Vrms = Vm/√2</li>
          <li>Ripple Factor: γ = 0.48 (much lower than half-wave)</li>
          <li>Efficiency: η = 81.2%</li>
          <li>Peak Inverse Voltage (PIV) = Vm</li>
        </ul>
        <strong>Advantages over Half-wave rectifier:</strong> Higher efficiency, lower ripple factor, better output, no center-tap transformer required.
      </div>
    ),
    tip: 'Draw the circuit with 4 diodes in diamond shape. Draw two waveforms — input sinewave and output pulsating DC. Always write Vdc = 2Vm/π and ripple factor = 0.48.',
  },
  {
    freq: 'high',
    freqLabel: '🔴 High Frequency — 4/5 years',
    marks: '10 Marks',
    part: 'Part B',
    question: 'Explain the V-I characteristics of Zener Diode and its use as a voltage regulator.',
    answer: (
      <div className="sg-ans-text">
        <strong>Zener Diode:</strong> A specially doped P-N junction diode designed to operate in the reverse breakdown region without damage.<br /><br />
        <strong>V-I Characteristics:</strong><br />
        <strong>Forward Bias Region:</strong> Behaves like a normal diode — current increases sharply after 0.7V (for Si).<br />
        <strong>Reverse Bias Region:</strong> A small reverse saturation current (Iz) flows until the Zener breakdown voltage (Vz) is reached. At Vz, the voltage remains nearly constant even if current increases significantly — this is the Zener breakdown region.<br /><br />
        <strong>Two Breakdown Mechanisms:</strong>
        <ul>
          <li><strong>Zener Breakdown:</strong> Occurs at low voltages (below 6V). Due to strong electric field breaking covalent bonds (quantum tunneling). Temperature coefficient is negative.</li>
          <li><strong>Avalanche Breakdown:</strong> Occurs at higher voltages (above 6V). Due to collision ionization. Temperature coefficient is positive.</li>
        </ul>
        <strong>Zener as Voltage Regulator:</strong> The Zener diode is connected in reverse bias across the load RL. A series resistor Rs is connected to limit the current. When input voltage varies, the Zener maintains a constant output voltage equal to Vz because it always operates in the breakdown region.
      </div>
    ),
    tip: 'Draw the V-I graph clearly showing forward region, reverse region, and the sharp vertical drop at Vz. Draw the regulator circuit with Rs in series and Zener in reverse across RL.',
  },
  {
    freq: 'med',
    freqLabel: '🟡 Medium — 2/5 years',
    marks: '2 Marks',
    part: 'Part A',
    question: 'Define rectifier. What is ripple factor? What is avalanche breakdown?',
    answer: (
      <div className="sg-ans-text">
        <strong>Rectifier:</strong> A rectifier is an electronic circuit that converts alternating current (AC) into direct current (DC) using diodes. It allows current to flow only in one direction.<br /><br />
        <strong>Ripple Factor (γ):</strong> It is the ratio of the RMS value of the AC component (ripple) to the DC component in the output of a rectifier. γ = Vac(rms) / Vdc. Lower ripple factor means better DC output. For bridge rectifier γ = 0.48; for half-wave γ = 1.21.<br /><br />
        <strong>Avalanche Breakdown:</strong> It occurs in a reverse-biased PN junction at high voltage. Thermally generated carriers gain enough energy from the electric field to ionize atoms on collision, creating new electron-hole pairs — like an avalanche. This occurs at reverse voltages above 6V.
      </div>
    ),
    tip: null,
  },
];

const UNIT2_CARDS = [
  {
    freq: 'high',
    freqLabel: '🔴 High Frequency — 4/5 years',
    marks: '10 Marks',
    part: 'Part B',
    question: 'Explain construction, principle of operation, characteristics and applications of UJT (Unijunction Transistor).',
    answer: (
      <div className="sg-ans-text">
        <strong>UJT — Unijunction Transistor</strong><br /><br />
        <strong>Construction:</strong> UJT consists of a lightly doped N-type silicon bar with two ohmic contacts at each end called Base 1 (B1) and Base 2 (B2). A P-type material is alloyed into the middle of the bar forming the Emitter (E). It has only one PN junction — hence "unijunction."<br /><br />
        <strong>Key Parameter — Intrinsic Stand-off Ratio (η):</strong> η = RB1 / (RB1 + RB2), typically 0.51 to 0.82.<br /><br />
        <strong>Principle of Operation:</strong> A supply voltage VBB is applied between B2 (+) and B1 (−). This creates a voltage drop η×VBB across RB1. When emitter voltage Ve exceeds (η×VBB + VD) where VD = 0.7V (diode drop), the PN junction becomes forward biased. Holes are injected from emitter into the bar, drastically reducing RB1 — causing a negative resistance region.<br /><br />
        <strong>Characteristics (Ve vs Ie graph):</strong>
        <ul>
          <li>Cut-off region: Ve less than Vp — no conduction</li>
          <li>Peak point (Vp): Emitter voltage at which conduction begins</li>
          <li>Negative Resistance Region: Ve decreases as Ie increases</li>
          <li>Valley point (Vv): Minimum voltage — saturation begins</li>
          <li>Saturation region: Normal resistance behavior</li>
        </ul>
        <strong>Applications:</strong>
        <ul>
          <li>Relaxation oscillator (most important application)</li>
          <li>Triggering circuit for SCR and TRIAC</li>
          <li>Sawtooth wave generator</li>
          <li>Phase control circuits</li>
        </ul>
        <strong>UJT Relaxation Oscillator:</strong> A capacitor C charges through resistor R until Ve reaches Vp. Then UJT fires, C discharges rapidly through B1, generating a sawtooth wave across C and a spike at B1. Frequency: f ≈ 1 / (RC × ln(1/(1−η))).
      </div>
    ),
    tip: 'This question appears in EVERY paper. Draw the UJT symbol, internal structure, equivalent circuit, and the Ve-Ie characteristic graph. Write all 4 applications. Mention the relaxation oscillator working.',
  },
  {
    freq: 'high',
    freqLabel: '🔴 High Frequency — 4/5 years',
    marks: '10 Marks',
    part: 'Part B',
    question: 'Explain the input and output characteristics of BJT in Common Emitter (CE) / Common Base (CB) configuration.',
    answer: (
      <div className="sg-ans-text">
        <strong>BJT in CE Configuration:</strong> In CE configuration, the emitter is common to both input (base-emitter) and output (collector-emitter) circuits.<br /><br />
        <strong>Input Characteristics (IB vs VBE at constant VCE):</strong><br />
        The graph resembles a forward-biased diode curve. As VBE increases beyond 0.7V (for Si), IB rises rapidly. As VCE increases, the curve shifts slightly right (Early effect).<br /><br />
        <strong>Output Characteristics (IC vs VCE at constant IB):</strong><br />
        Three regions:
        <ul>
          <li><strong>Saturation Region:</strong> VCE is small (0 to 0.3V). Both junctions are forward biased. IC rises sharply.</li>
          <li><strong>Active Region:</strong> IC remains nearly constant (flat region) for a given IB as VCE increases. Here IC = β×IB. Transistor acts as an amplifier in this region.</li>
          <li><strong>Cutoff Region:</strong> IB = 0, only small leakage current ICEO flows.</li>
        </ul>
        <strong>Early Effect:</strong> As VCE increases in active region, collector depletion region widens, reducing base width. This slightly increases IC.<br /><br />
        <strong>Important Parameters:</strong>
        <ul>
          <li>Current gain: β (hFE) = IC / IB (typically 20–500)</li>
          <li>α = IC / IE = β / (β+1)</li>
        </ul>
      </div>
    ),
    tip: 'Draw both graphs neatly. Label axes, all three regions (saturation, active, cutoff), and mark where β is measured. Write the formula β = IC/IB.',
  },
  {
    freq: 'med',
    freqLabel: '🟡 Medium — 2/5 years',
    marks: '2 Marks',
    part: 'Part A',
    question: 'Compare CB, CE and CC amplifier configurations (AV, AI, Ri, Ro). / What is need for biasing? / How does transistor act as amplifier?',
    answer: (
      <div className="sg-ans-text">
        <strong>Comparison of BJT Configurations:</strong><br /><br />
        <table className="sg-table">
          <thead>
            <tr>
              <th>Parameter</th><th>CB</th><th>CE</th><th>CC</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Voltage Gain (Av)</td><td>High</td><td>Highest</td><td>&lt;1</td></tr>
            <tr><td>Current Gain (Ai)</td><td>&lt;1</td><td>High (β)</td><td>High (β+1)</td></tr>
            <tr><td>Input Resistance</td><td>Low (~50Ω)</td><td>Medium (~1kΩ)</td><td>High (~500kΩ)</td></tr>
            <tr><td>Output Resistance</td><td>High (~1MΩ)</td><td>High (~50kΩ)</td><td>Low (~100Ω)</td></tr>
            <tr><td>Phase shift</td><td>0°</td><td>180°</td><td>0°</td></tr>
          </tbody>
        </table>
        <br />
        <strong>Need for Biasing:</strong> Biasing sets the transistor's DC operating point (Q-point) in the active region so that the output does not get clipped/distorted when an AC signal is applied.<br /><br />
        <strong>Transistor as Amplifier:</strong> In active region, a small change in base current (ΔIB) causes a large change in collector current (ΔIC = β × ΔIB). This large IC variation across load resistor RL produces a magnified output voltage.
      </div>
    ),
    tip: null,
  },
];

const UNIT3_CARDS = [
  {
    freq: 'high',
    freqLabel: '🔴 High Frequency — 4/5 years',
    marks: '10 Marks',
    part: 'Part B',
    question: 'Explain the construction and working of JFET. Draw and explain its characteristics.',
    answer: (
      <div className="sg-ans-text">
        <strong>JFET — Junction Field Effect Transistor</strong><br /><br />
        <strong>Construction (N-channel JFET):</strong> A thin bar of N-type semiconductor material forms the channel between Source (S) and Drain (D). On both sides of the channel, P-type regions are formed — both connected together to form the Gate (G).<br /><br />
        <strong>Working Principle:</strong> The gate-channel junction is always reverse biased (VGS is negative for N-channel). When VGS = 0, the channel is fully open, and maximum current (IDSS) flows from drain to source. As VGS is made more negative, the depletion regions widen, reducing ID. When VGS reaches the Pinch-off voltage (VP), the channel is completely closed and ID = 0.<br /><br />
        <strong>Drain Characteristics (ID vs VDS):</strong>
        <ul>
          <li><strong>Ohmic/Linear Region:</strong> ID increases linearly with VDS (like a resistor)</li>
          <li><strong>Pinch-off/Saturation Region:</strong> ID becomes nearly constant. JFET is used as an amplifier here.</li>
          <li><strong>Breakdown Region:</strong> At very high VDS, avalanche breakdown occurs.</li>
        </ul>
        <strong>Transfer Characteristics (ID vs VGS):</strong> ID = IDSS × (1 − VGS/VP)² — Shockley's equation.<br /><br />
        <strong>Key Parameters:</strong>
        <ul>
          <li>Transconductance: gm = ΔID / ΔVGS</li>
          <li>IDSS = drain current when VGS = 0</li>
          <li>VP = pinch-off voltage</li>
        </ul>
        <strong>FET as VVR:</strong> In the ohmic region, FET's drain-to-source resistance rDS varies with VGS — making it a voltage-controlled resistor.
      </div>
    ),
    tip: 'Draw the N-channel JFET cross-section. Draw both drain characteristics (family of curves for different VGS values) and transfer characteristics curve. Write Shockley\'s equation.',
  },
  {
    freq: 'high',
    freqLabel: '🔴 High Frequency — 3/5 years',
    marks: '10 Marks',
    part: 'Part B',
    question: 'Describe the construction and working of Enhancement type and Depletion type MOSFET.',
    answer: (
      <div className="sg-ans-text">
        <strong>MOSFET — Metal Oxide Semiconductor FET</strong><br /><br />
        <strong>Depletion Type N-channel MOSFET:</strong><br />
        Structure: P-type substrate with two N+ diffused regions (Source and Drain). An N-channel already exists between S and D. A thin SiO₂ layer insulates the metal gate from the channel.<br />
        Working: When VGS = 0, current flows through existing channel. When VGS is negative, electrons are repelled → channel depletes → ID decreases (depletion mode). When VGS is positive → more electrons attracted → ID increases (enhancement mode). Can operate in both modes.<br /><br />
        <strong>Enhancement Type N-channel MOSFET:</strong><br />
        Structure: Same as depletion type but NO physical channel exists initially.<br />
        Working: When VGS = 0, no current flows. When VGS exceeds threshold voltage (VT), an N-type inversion layer (channel) is induced in the P-substrate below the gate. Now current flows from D to S. Works only in enhancement mode.<br /><br />
        <strong>Modes of MOSFET:</strong>
        <ul>
          <li>Depletion MOSFET: operates in both depletion and enhancement modes</li>
          <li>Enhancement MOSFET: operates only in enhancement mode (VGS must exceed VT)</li>
        </ul>
        <strong>Characteristics:</strong> Drain characteristics show: cutoff region (VGS &lt; VT), ohmic region, and saturation/pinch-off region. Transfer characteristic shows ID vs VGS — parabolic curve starting from VT.
      </div>
    ),
    tip: 'Draw both MOSFET cross-sections side by side. Show presence/absence of channel clearly. Draw the drain and transfer characteristics for both types. Mention that gate is electrically isolated — hence very high input impedance.',
  },
];

const UNIT4_CARDS = [
  {
    freq: 'high',
    freqLabel: '🔴 High Frequency — 4/5 years',
    marks: '10 Marks',
    part: 'Part B',
    question: 'Simplify Boolean expression using K-map and implement using NAND/NOR gates.',
    answer: (
      <div className="sg-ans-text">
        <strong>Karnaugh Map (K-map) Simplification Steps:</strong><br /><br />
        <div className="sg-point"><span className="sg-point-num">1.</span><span>Write the Boolean function in SOP (Sum of Products) or POS form and identify all minterms/maxterms.</span></div>
        <div className="sg-point"><span className="sg-point-num">2.</span><span>Draw the K-map grid. For 4 variables (A,B,C,D): 4×4 grid with Gray code order (00,01,11,10).</span></div>
        <div className="sg-point"><span className="sg-point-num">3.</span><span>Fill 1s in cells corresponding to minterms (for SOP) or 0s for maxterms (for POS).</span></div>
        <div className="sg-point"><span className="sg-point-num">4.</span><span>Group 1s in groups of 1, 2, 4, 8, 16 (must be powers of 2). Groups can wrap around edges. Make groups as large as possible.</span></div>
        <div className="sg-point"><span className="sg-point-num">5.</span><span>For each group, write the product term: variables that don't change in the group are kept; variables that change are eliminated.</span></div>
        <div className="sg-point"><span className="sg-point-num">6.</span><span>OR all product terms to get the simplified SOP expression.</span></div>
        <br />
        <strong>NAND-NAND Implementation (for SOP):</strong> Apply De Morgan's theorem: A·B·C = ((A·B·C)')'. A sum of products can be implemented using only NAND gates — first level NAND gates replace AND gates, second level NAND gate replaces OR gate (double inversion principle).<br /><br />
        <strong>NOR-NOR Implementation (for POS):</strong> Similarly, a product of sums can be implemented using only NOR gates.<br /><br />
        <strong>Why NAND/NOR are Universal Gates:</strong> Any Boolean function can be implemented using only NAND gates or only NOR gates. This reduces manufacturing cost.
      </div>
    ),
    tip: 'In exam, they give you a function — draw the 4×4 K-map, group correctly, write simplified expression, then convert to NAND using the double-bar method. Practice: F(W,X,Y,Z) = W\'X\'Y\'Z\' + WXY\'Z\' + W\'X\'YZ + WXYZ.',
  },
  {
    freq: 'high',
    freqLabel: '🔴 High Frequency — 3/5 years',
    marks: '10 Marks',
    part: 'Part B',
    question: 'Explain the working principle of Multiplexer (MUX) and Demultiplexer (DEMUX) / Encoder and Decoder.',
    answer: (
      <div className="sg-ans-text">
        <strong>Multiplexer (MUX):</strong> A combinational circuit that selects one of many (2ⁿ) input data lines and routes it to a single output line, based on n select lines. Also called a data selector.<br />
        Example — 4:1 MUX: 4 inputs (I0–I3), 2 select lines (S1, S0), 1 output Y.<br />
        Boolean: Y = S1'S0'I0 + S1'S0I1 + S1S0'I2 + S1S0I3<br /><br />
        <strong>Demultiplexer (DEMUX):</strong> Opposite of MUX — takes one input and routes it to one of 2ⁿ outputs based on select lines. Also called a data distributor.<br /><br />
        <strong>Encoder:</strong> Converts 2ⁿ input lines into n-bit binary code. Only one input is active at a time. Example — 8:3 priority encoder converts 8 inputs to 3-bit binary output.<br /><br />
        <strong>Decoder:</strong> Converts n-bit binary input into 2ⁿ output lines — activates one output for each input combination. Example — 2:4 decoder:<br />
        Boolean: Y0=A'B', Y1=A'B, Y2=AB', Y3=AB<br /><br />
        <strong>Applications of MUX:</strong> Data transmission, function generation, parallel-to-serial conversion.<br />
        <strong>Applications of Decoder:</strong> Memory address decoding, BCD to 7-segment display.
      </div>
    ),
    tip: 'Draw the block diagram of 4:1 MUX, its truth table, and logic circuit. For decoder, draw 2:4 decoder truth table and logic circuit. Both appear repeatedly — know both!',
  },
  {
    freq: 'med',
    freqLabel: '🟡 Medium — 3/5 years',
    marks: '2 Marks',
    part: 'Part A',
    question: 'Number system conversions: Binary↔Gray code, Binary arithmetic, Excess-3, Hamming code',
    answer: (
      <div className="sg-ans-text">
        <strong>Binary to Gray Code:</strong> MSB of Gray = MSB of Binary. Each subsequent Gray bit = XOR of corresponding binary bit and previous binary bit.<br />
        Example: Binary 1011 → Gray: 1, 1⊕0=1, 0⊕1=1, 1⊕1=0 → Gray = 1110<br /><br />
        <strong>Gray to Binary:</strong> MSB of Binary = MSB of Gray. Each subsequent binary bit = XOR of previous binary bit and current gray bit.<br /><br />
        <strong>2's Complement Subtraction:</strong> A − B = A + (2's complement of B). 2's complement = 1's complement + 1. If carry out = 1, result is positive; if no carry, result is negative.<br /><br />
        <strong>Excess-3 Code:</strong> Add 3 (0011) to each BCD digit and convert to 4-bit binary.<br />
        Example: Decimal 5 = BCD 0101, add 0011 = 1000 (Excess-3).<br /><br />
        <strong>Hamming Code (for 8-bit data word):</strong> Number of parity bits r must satisfy: 2^r ≥ n + r + 1 (where n = 8 data bits). So r = 4 parity bits. Total bits = 12. Parity bits at positions 1,2,4,8.
      </div>
    ),
    tip: 'Practice conversion problems from all papers. The 2023 paper asked: convert (101011)₂ to Gray and convert Gray (101101) to binary. These 4-6 mark numericals are easy marks!',
  },
];

const UNIT5_CARDS = [
  {
    freq: 'high',
    freqLabel: '🔴 High Frequency — 4/5 years',
    marks: '10 Marks',
    part: 'Part B',
    question: 'Design a synchronous counter (MOD-5, 3-bit binary, BCD) using JK Flip-flops.',
    answer: (
      <div className="sg-ans-text">
        <strong>Step 1 — State Table:</strong> For a 3-bit binary up counter, states are 000→001→010→011→100→101→110→111→000.<br /><br />
        <strong>Step 2 — JK FF Excitation Table:</strong><br />
        <table className="sg-table">
          <thead><tr><th>Q(t)→Q(t+1)</th><th>J</th><th>K</th></tr></thead>
          <tbody>
            <tr><td>0 → 0</td><td>0</td><td>X</td></tr>
            <tr><td>0 → 1</td><td>1</td><td>X</td></tr>
            <tr><td>1 → 0</td><td>X</td><td>1</td></tr>
            <tr><td>1 → 1</td><td>X</td><td>0</td></tr>
          </tbody>
        </table>
        <br />
        <strong>Step 3 — K-map expressions for 3-bit up counter:</strong><br />
        J0 = K0 = 1 (Q0 toggles every clock)<br />
        J1 = K1 = Q0 (Q1 toggles when Q0=1)<br />
        J2 = K2 = Q1·Q0 (Q2 toggles when Q1=1 and Q0=1)<br /><br />
        <strong>Step 4 — Draw Circuit:</strong> Three JK FFs connected with shared clock. AND gate generating Q1·Q0 feeds J2,K2. Q0 feeds J1,K1. Logic 1 feeds J0,K0.<br /><br />
        <strong>For MOD-5 Counter:</strong> Same steps but only 5 states (000 to 100). State 101 and beyond are unused (mark as don't care in K-map). Use NAND gate feedback: when Q2=1 and Q0=1 (state 101 = decimal 5), reset all FFs to 000.
      </div>
    ),
    tip: 'This type of question appears every single year. Learn the 4 steps: State table → Excitation table → K-map for J,K expressions → Draw circuit. The JK excitation table must be memorized.',
  },
  {
    freq: 'high',
    freqLabel: '🔴 High Frequency — 3/5 years',
    marks: '10 Marks',
    part: 'Part B',
    question: 'Flip-flop conversions: SR to JK, JK to D, JK to T, SR to T-flip-flop',
    answer: (
      <div className="sg-ans-text">
        <strong>General Method for Flip-flop Conversion:</strong>
        <div className="sg-point"><span className="sg-point-num">1.</span><span>Write the state transition table for the desired FF (e.g., JK FF)</span></div>
        <div className="sg-point"><span className="sg-point-num">2.</span><span>For each transition Q→Q+, find the required inputs of the given FF (e.g., SR FF) using its excitation table</span></div>
        <div className="sg-point"><span className="sg-point-num">3.</span><span>Use K-map to simplify the expressions for S and R in terms of J, K, and Q</span></div>
        <div className="sg-point"><span className="sg-point-num">4.</span><span>Draw the circuit: given FF + combinational logic from step 3</span></div>
        <br />
        <strong>Key Conversion Results:</strong><br />
        SR to JK: S = J·Q', R = K·Q<br />
        JK to D: J = D, K = D'<br />
        JK to T: J = T, K = T<br />
        SR to T: S = T·Q', R = T·Q<br /><br />
        <strong>Race Around Condition (JK FF):</strong> When J=K=1 and clock pulse width is long, the output toggles multiple times during one clock period. Solution: Use Master-Slave JK FF or edge-triggered FF.
      </div>
    ),
    tip: 'Memorize these conversion formulas. They give you 5 or 10 marks for just writing the excitation table, K-map, expression, and circuit diagram.',
  },
  {
    freq: 'med',
    freqLabel: '🟡 Medium — 3/5 years',
    marks: '2 Marks',
    part: 'Part A',
    question: 'Define: Latch, Counter, Sequential circuit, Shift register applications, JK characteristic equation',
    answer: (
      <div className="sg-ans-text">
        <strong>Latch:</strong> A latch is a level-triggered bistable multivibrator that stores one bit of data. It can change its output whenever the enable/clock is HIGH (transparent). SR latch, D latch are examples.<br /><br />
        <strong>Counter:</strong> A sequential circuit that counts clock pulses and produces a binary sequence at its output. Synchronous counters: all FFs triggered simultaneously. Asynchronous (ripple) counters: each FF triggers the next.<br /><br />
        <strong>Sequential Circuit:</strong> A digital circuit whose output depends on both the present input AND the present state (memory). Examples: flip-flops, registers, counters. Differs from combinational circuits which have no memory.<br /><br />
        <strong>Applications of Shift Registers:</strong> Serial-to-parallel conversion, parallel-to-serial conversion, data storage, sequence generation, delay circuits, ring counters, and Johnson counters.<br /><br />
        <strong>JK Flip-flop Characteristic Equation:</strong> Q(t+1) = J·Q'(t) + K'·Q(t)<br /><br />
        <strong>Excitation Table:</strong> 0→0: J=0,K=X | 0→1: J=1,K=X | 1→0: J=X,K=1 | 1→1: J=X,K=0
      </div>
    ),
    tip: null,
  },
];

const ALL_UNIT_CARDS = {
  unit1: UNIT1_CARDS,
  unit2: UNIT2_CARDS,
  unit3: UNIT3_CARDS,
  unit4: UNIT4_CARDS,
  unit5: UNIT5_CARDS,
};

function QCard({ card }) {
  const [open, setOpen] = useState(false);

  const badgeFreqStyle = card.freq === 'high'
    ? { background: '#FCEBEB', color: '#A32D2D' }
    : { background: '#FAEEDA', color: '#633806' };

  return (
    <div className="sg-qcard">
      <div className="sg-qcard-header" onClick={() => setOpen(o => !o)}>
        <div style={{ flex: 1 }}>
          <div className="sg-q-meta">
            <span className="sg-badge" style={badgeFreqStyle}>{card.freqLabel}</span>
            <span className="sg-badge sg-badge-marks">{card.marks}</span>
            <span className="sg-badge sg-badge-unit">{card.part}</span>
          </div>
          <div className="sg-q-text">{card.question}</div>
        </div>
        <div className={`sg-chevron${open ? ' open' : ''}`}>⌄</div>
      </div>
      {open && (
        <div className="sg-qcard-body">
          <div className="sg-answer-section">
            <div className="sg-ans-label">Exam-Ready Answer</div>
            {card.answer}
            {card.tip && (
              <div className="sg-tip"><strong>Exam tip:</strong> {card.tip}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudyGuide() {
  const [activeUnit, setActiveUnit] = useState('unit1');

  const cards = ALL_UNIT_CARDS[activeUnit] || [];

  return (
    <>
      <h2 className="sr-only">ADE Exam Study Guide - Questions and Answers from Previous Year Papers</h2>

      <style>{`
        .sg-container { padding: 0.5rem 0 2rem; }
        .sg-header { margin-bottom: 1.25rem; }
        .sg-header h1 { font-size: 20px; font-weight: 600; color: #e2e8f0; margin-bottom: 4px; }
        .sg-header p { font-size: 14px; color: #94a3b8; }

        .sg-score-info {
          background: rgba(255,255,255,0.03);
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 1.25rem;
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.6;
        }
        .sg-score-info strong { color: #e2e8f0; font-weight: 500; }

        .sg-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 1.25rem; }
        .sg-tab {
          padding: 6px 14px;
          font-size: 13px;
          border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          cursor: pointer;
          background: transparent;
          color: #94a3b8;
          transition: all 0.15s;
          font-family: inherit;
        }
        .sg-tab.active {
          background: rgba(139,92,246,0.15);
          color: #c4b5fd;
          border-color: rgba(139,92,246,0.35);
          font-weight: 500;
        }
        .sg-tab:hover:not(.active) { background: rgba(255,255,255,0.04); color: #e2e8f0; }

        .sg-qcard {
          background: rgba(255,255,255,0.02);
          border: 0.5px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          margin-bottom: 10px;
          overflow: hidden;
          transition: border-color 0.15s;
        }
        .sg-qcard:hover { border-color: rgba(139,92,246,0.2); }

        .sg-qcard-header {
          padding: 14px 16px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        .sg-qcard-header:hover { background: rgba(255,255,255,0.02); }

        .sg-q-meta { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; margin-bottom: 6px; }
        .sg-badge { font-size: 11px; padding: 2px 8px; border-radius: 20px; font-weight: 500; }
        .sg-badge-marks { background: rgba(59,130,246,0.15); color: #93c5fd; }
        .sg-badge-unit { background: rgba(34,197,94,0.12); color: #86efac; }

        .sg-q-text { font-size: 14px; font-weight: 500; color: #e2e8f0; line-height: 1.5; }

        .sg-chevron { font-size: 18px; color: #64748b; transition: transform 0.2s; flex-shrink: 0; margin-top: 2px; }
        .sg-chevron.open { transform: rotate(180deg); }

        .sg-qcard-body {
          padding: 0 16px 16px;
          border-top: 0.5px solid rgba(255,255,255,0.06);
          animation: sg-fade-in 0.18s ease;
        }
        @keyframes sg-fade-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

        .sg-answer-section { margin-top: 14px; }
        .sg-ans-label {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 8px;
        }
        .sg-ans-text { font-size: 14px; color: #cbd5e1; line-height: 1.75; }
        .sg-ans-text strong { font-weight: 500; color: #e2e8f0; }
        .sg-ans-text ul { margin: 8px 0 8px 18px; }
        .sg-ans-text ul li { margin-bottom: 4px; }

        .sg-point { display: flex; gap: 8px; margin-bottom: 8px; }
        .sg-point-num { font-weight: 600; color: #818cf8; flex-shrink: 0; font-size: 13px; min-width: 20px; }

        .sg-tip {
          background: rgba(251,191,36,0.08);
          border: 0.5px solid rgba(251,191,36,0.2);
          border-radius: 10px;
          padding: 10px 12px;
          margin-top: 12px;
          font-size: 13px;
          color: #fcd34d;
          line-height: 1.6;
        }
        .sg-tip strong { font-weight: 500; }

        .sg-table {
          width: 100%;
          font-size: 13px;
          border-collapse: collapse;
          margin: 6px 0;
        }
        .sg-table th {
          padding: 6px 8px;
          border: 0.5px solid rgba(255,255,255,0.08);
          font-weight: 600;
          background: rgba(255,255,255,0.04);
          color: #e2e8f0;
          text-align: left;
        }
        .sg-table td {
          padding: 6px 8px;
          border: 0.5px solid rgba(255,255,255,0.06);
          color: #cbd5e1;
        }
        .sg-table tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
      `}</style>

      <div className="sg-container">
        <div className="sg-header">
          <h1>ADE Exam Study Guide</h1>
          <p>Most repeated questions across 5 years — with full exam-ready answers</p>
        </div>

        <div className="sg-score-info">
          <strong>Strategy to score 40+:</strong> Part A = 20 marks (answer all 10 short questions, 2M each). Part B = choose 5 questions × 10M = 50 marks. Focus on the <span style={{ color: '#fca5a5', fontWeight: 500 }}>🔴 High Frequency</span> topics — they repeat every year.
        </div>

        <div className="sg-tabs">
          {UNITS.map(u => (
            <button
              key={u.id}
              className={`sg-tab${activeUnit === u.id ? ' active' : ''}`}
              onClick={() => setActiveUnit(u.id)}
            >
              {u.label}
            </button>
          ))}
        </div>

        <div>
          {cards.map((card, i) => (
            <QCard key={i} card={card} />
          ))}
        </div>
      </div>
    </>
  );
}
