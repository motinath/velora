import logging
import time
from typing import List, Dict, Any, Generator
from app.ai.providers.base import ModelProvider
from app.config import settings

logger = logging.getLogger(__name__)

class MockProvider(ModelProvider):
    def _get_mock_response(self, user_prompt: str) -> str:
        prompt_lower = user_prompt.lower()
        
        # 1. RTL Generation (e.g. ALU)
        if "alu" in prompt_lower or "design an 8-bit" in prompt_lower or "alu schematic" in prompt_lower or "alu circuit" in prompt_lower:
            return """Here is a synthesizable 8-bit Arithmetic Logic Unit (ALU) implemented in Verilog, including a dynamic interactive circuit schematic, design explanation, and truth table.

[CIRCUIT_DIAGRAM]
{
  "title": "8-Bit ALU Core Schematic",
  "nodes": [
    { "id": "A", "label": "A[7:0]", "type": "input", "x": 40, "y": 60, "outputs": ["out"], "description": "8-bit input operand A containing the primary data value." },
    { "id": "B", "label": "B[7:0]", "type": "input", "x": 40, "y": 140, "outputs": ["out"], "description": "8-bit input operand B containing the secondary data value." },
    { "id": "OP", "label": "op[2:0]", "type": "input", "x": 40, "y": 240, "outputs": ["out"], "description": "3-bit operation select code specifying arithmetic or bitwise modes." },
    { "id": "ADDER", "label": "Adder/Subtr", "type": "block", "x": 220, "y": 50, "inputs": ["a", "b"], "outputs": ["sum", "cout"], "description": "8-bit Ripple-Carry Adder and Subtractor unit." },
    { "id": "LOGIC", "label": "Bitwise OR/AND", "type": "block", "x": 220, "y": 170, "inputs": ["a", "b"], "outputs": ["out"], "description": "Bitwise Boolean operations logic gate unit." },
    { "id": "MUX", "label": "Operation Mux", "type": "mux", "x": 420, "y": 110, "inputs": ["in0", "in1", "sel"], "outputs": ["out"], "description": "2-to-1 multiplexer routing the selected operation result to the output driver." },
    { "id": "OUT_REG", "label": "Output Reg", "type": "register", "x": 580, "y": 120, "inputs": ["d"], "outputs": ["q"], "description": "D Flip-flop storage register latching the final result on the rising clock edge." },
    { "id": "RESULT", "label": "result[7:0]", "type": "output", "x": 740, "y": 130, "inputs": ["in"], "description": "Final output bus driven to the data highway." }
  ],
  "connections": [
    { "from": "A:out", "to": "ADDER:a", "color": "#06b6d4" },
    { "from": "B:out", "to": "ADDER:b", "color": "#06b6d4" },
    { "from": "A:out", "to": "LOGIC:a", "color": "#a855f7" },
    { "from": "B:out", "to": "LOGIC:b", "color": "#a855f7" },
    { "from": "OP:out", "to": "MUX:sel", "color": "#eab308" },
    { "from": "ADDER:sum", "to": "MUX:in0", "color": "#10b981" },
    { "from": "LOGIC:out", "to": "MUX:in1", "color": "#10b981" },
    { "from": "MUX:out", "to": "OUT_REG:d", "color": "#3b82f6" },
    { "from": "OUT_REG:q", "to": "RESULT:in", "color": "#3b82f6" }
  ]
}
[/CIRCUIT_DIAGRAM]

### 1. Verilog Module (`alu_8bit.v`)
```verilog
module alu_8bit (
    input  wire [7:0] a,
    input  wire [7:0] b,
    input  wire [2:0] op,      // Operation select
    output reg  [7:0] result,
    output reg        carry_out,
    output reg        zero,
    output reg        overflow
);

    always @(*) begin
        // Default assignments to prevent unintended latches
        carry_out = 1'b0;
        overflow  = 1'b0;
        result    = 8'h00;
        
        case (op)
            3'b000: result = a + b;                  // ADD
            3'b001: begin
                {carry_out, result} = a - b;        // SUB
                overflow = (a[7] ^ b[7]) && (result[7] ^ a[7]);
            end
            3'b010: result = a & b;                  // AND
            3'b011: result = a | b;                  // OR
            3'b100: result = a ^ b;                  // XOR
            3'b101: result = ~a;                     // NOT A
            3'b110: result = a << b[2:0];            // Shift Left Logical
            3'b111: result = a >> b[2:0];            // Shift Right Logical
            default: result = 8'h00;
        endcase
        
        zero = (result == 8'h00);
    end

endmodule
```

### 2. Explanation of Design Choices
* **Blocking vs Non-blocking**: Used blocking assignments (`=`) inside the combinational `always @(*)` block.
* **Latch Prevention**: Initialized all outputs (`carry_out`, `overflow`, `result`) at the beginning of the `always` block to avoid creating transparent latches.
* **Overflow Logic**: Checked sign bit mismatch for subtraction to detect arithmetic overflow.

### 3. Truth Table
| OP Code | Operation | Description |
|:---|:---|:---|
| 000 | ADD | result = a + b |
| 001 | SUB | result = a - b |
| 010 | AND | result = a & b |
| 011 | OR  | result = a \\| b |
| 100 | XOR | result = a ^ b |
| 101 | NOT | result = ~a |
| 110 | SLL | result = a << b |
| 111 | SRL | result = a >> b |

### 4. Basic Testbench (`tb_alu_8bit.v`)
```verilog
`timescale 1ns/1ps

module tb_alu_8bit;
    reg  [7:0] a, b;
    reg  [2:0] op;
    wire [7:0] result;
    wire carry_out, zero, overflow;

    alu_8bit uut (
        .a(a), .b(b), .op(op),
        .result(result), .carry_out(carry_out),
        .zero(zero), .overflow(overflow)
    );

    initial begin
        a = 8'd10; b = 8'd5; op = 3'b000; #10; // Expected ADD: 15
        a = 8'd10; b = 8'd12; op = 3'b001; #10; // Expected SUB: -2
        a = 8'hF0; b = 8'h0F; op = 3'b010; #10; // Expected AND: 0
        $finish;
    end
endmodule
```"""

        # 2. Timing/Slack issues & Register stage
        elif any(w in prompt_lower for w in ["setup and hold", "slack", "timing", "register", "flip-flop", "sequential"]):
            return """Here is an explanation of setup and hold timing constraints, combined with an interactive register stage timing schematic.

[CIRCUIT_DIAGRAM]
{
  "title": "Register Stage & Timing Path",
  "nodes": [
    { "id": "DIN", "label": "Data D", "type": "input", "x": 40, "y": 70, "outputs": ["out"], "description": "Incoming logic data input pin." },
    { "id": "CLK_IN", "label": "Clock CLK", "type": "input", "x": 40, "y": 190, "outputs": ["out"], "description": "Global clock tree source." },
    { "id": "BUF_D", "label": "Data Buffer", "type": "gate", "x": 200, "y": 60, "inputs": ["in"], "outputs": ["out"], "description": "Logic cells delaying data arrival path." },
    { "id": "BUF_CLK", "label": "Clock Tree Buf", "type": "gate", "x": 200, "y": 180, "inputs": ["in"], "outputs": ["out"], "description": "Clock tree delay buffers contributing to skew." },
    { "id": "DFF", "label": "D Flip-Flop", "type": "register", "x": 380, "y": 100, "inputs": ["d", "clk"], "outputs": ["q"], "description": "Edge-triggered sequential storage element requiring setup/hold checks." },
    { "id": "QOUT", "label": "Output Q", "type": "output", "x": 560, "y": 120, "inputs": ["in"], "description": "Registered output signal driven to next stage." }
  ],
  "connections": [
    { "from": "DIN:out", "to": "BUF_D:in", "color": "#06b6d4" },
    { "from": "CLK_IN:out", "to": "BUF_CLK:in", "color": "#a855f7" },
    { "from": "BUF_D:out", "to": "DFF:d", "color": "#06b6d4" },
    { "from": "BUF_CLK:out", "to": "DFF:clk", "color": "#a855f7" },
    { "from": "DFF:q", "to": "QOUT:in", "color": "#10b981" }
  ]
}
[/CIRCUIT_DIAGRAM]

### Understanding Setup and Hold Time constraints

In digital design, **Setup Time ($t_s$)** and **Hold Time ($t_h$)** are the fundamental constraints for flip-flops to capture data reliably.

```text
               +------+
Data In  ------| D  Q |---- Data Out
               |      |
Clock    ------|>     |
               +------+
```

1. **Setup Time Constraint**:
   Data must be stable at the inputs of a flip-flop **before** the active clock edge arrives.
   $$T_{clk} \\ge T_{c2q} + T_{comb} + T_{setup} - T_{skew}$$
   * **Violations**: Happen when the combinational delay ($T_{comb}$) is too long, or the clock speed is too fast.
   * **Fixes**: Increase clock period (reduce speed), pipeline long paths, perform register balancing, or reduce cell delays.

2. **Hold Time Constraint**:
   Data must remain stable at the inputs **after** the active clock edge.
   $$T_{c2q} + T_{comb} \\ge T_{hold} + T_{skew}$$
   * **Violations**: Happen when data propagates too fast relative to clock skew. It does *not* depend on the clock frequency.
   * **Fixes**: Insert delay buffers, fix clock skew, route clock tree properly.

*Do you have a specific report or pathway that fails? Upload it and I will explain the critical node points.*"""

        # 3. Clock Tree Synthesis (CTS)
        elif "cts" in prompt_lower or "clock tree" in prompt_lower:
            return """**Clock Tree Synthesis (CTS)** is the process of distributing the clock signal to all clocking elements (sequential cells like Flip-Flops and Latches) in a chip design with minimum skew and latency.

### Key Metrics in CTS:
* **Clock Skew**: The difference in arrival times of the clock signal at two different registers.
  * *Local Skew*: Between registers sharing a path. Can cause hold violations.
  * *Global Skew*: Maximum skew across the entire chip.
* **Clock Insertion Delay (Latency)**: Time taken for the clock signal to travel from the clock source (PLL/input pin) to the leaf registers.
* **Slew Rate**: Transition time of the clock pulse. Poor slew rate results in high power and noise susceptibility.

### Common Clock Topologies:
1. **H-Tree**: Highly symmetric distribution. Excellent for low skew, but consumes high area and routing resources.
2. **Fishbone**: Central clock spine with ribs. Easier to route, but higher skew than H-tree.
3. **Clock Mesh**: Distributes a grid grid of clocks. Extreme low skew, used in high-performance CPUs, but massive power consumption."""

        # 4. DRC / LVS
        elif "drc" in prompt_lower or "lvs" in prompt_lower:
            return """### DRC and LVS Physical Verification Overview

* **Design Rule Checking (DRC)**: Verifies that the physical layout meets the manufacturing constraints of the foundry (PDK).
  * *Common Violations*: Metal spacing (wires too close), minimum width, antenna effect, latchup clearances.
  * *Resolution*: Spacing wires further apart, widening critical tracks, inserting antenna diodes.
* **Layout Versus Schematic (LVS)**: Compares the electrical connectivity of the layout against the netlist generated from the schematic/RTL.
  * *Common Violations*: Open circuits, short circuits, missing components, parameter mismatches (e.g. transistor width mismatch).
  * *Resolution*: Checking connectivity labels, checking wire splits, identifying shorted nets."""

        # 5. Default Response
        return """Hello! I am **Velora**, your AI Semiconductor Engineering Copilot.

I am configured in **Modular Agent Mode** to assist you across the chip design flow:
1. **RTL Generation & Review**: SystemVerilog/Verilog modules, FSMs, latches, blocking vs non-blocking checks.
2. **Static Timing Analysis (STA)**: Explaining setup/hold failures, slack margins, path segment delays.
3. **Log Diagnostics**: Identifying synthesis (e.g. Yosys) warnings/errors.
4. **Knowledge Engine (RAG)**: Answering concepts based on process rules, documentation, and design guidelines.

How can I help you in your project workspace today?"""

    def generate(self, system_prompt: str, user_prompt: str, chat_history: List[Dict[str, str]] = None) -> str:
        # Simulate slight network delay
        time.sleep(0.5)
        return self._get_mock_response(user_prompt)

    def generate_stream(self, system_prompt: str, user_prompt: str, chat_history: List[Dict[str, str]] = None) -> Generator[str, None, None]:
        text = self._get_mock_response(user_prompt)
        words = text.split(" ")
        for i, word in enumerate(words):
            yield (word + " " if i < len(words) - 1 else word)
            time.sleep(0.01)


class OpenAIProvider(ModelProvider):
    def generate(self, system_prompt: str, user_prompt: str, chat_history: List[Dict[str, str]] = None) -> str:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            
            messages = [{"role": "system", "content": system_prompt}]
            if chat_history:
                for h in chat_history:
                    messages.append({"role": h["role"], "content": h["content"]})
            messages.append({"role": "user", "content": user_prompt})
            
            response = client.chat.completions.create(
                model=settings.MODEL_NAME if settings.MODEL_NAME != "mock-model" else "gpt-4-turbo",
                messages=messages,
                temperature=0.1
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            logger.error(f"OpenAI generate failed, falling back to mock. Error: {e}")
            return MockProvider().generate(system_prompt, user_prompt, chat_history)

    def generate_stream(self, system_prompt: str, user_prompt: str, chat_history: List[Dict[str, str]] = None) -> Generator[str, None, None]:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            
            messages = [{"role": "system", "content": system_prompt}]
            if chat_history:
                for h in chat_history:
                    messages.append({"role": h["role"], "content": h["content"]})
            messages.append({"role": "user", "content": user_prompt})
            
            response = client.chat.completions.create(
                model=settings.MODEL_NAME if settings.MODEL_NAME != "mock-model" else "gpt-4-turbo",
                messages=messages,
                temperature=0.1,
                stream=True
            )
            for chunk in response:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            logger.error(f"OpenAI stream failed, falling back to mock. Error: {e}")
            yield from MockProvider().generate_stream(system_prompt, user_prompt, chat_history)


class ClaudeProvider(ModelProvider):
    def generate(self, system_prompt: str, user_prompt: str, chat_history: List[Dict[str, str]] = None) -> str:
        # Fallback to mock for now since it is stubbed
        return MockProvider().generate(system_prompt, user_prompt, chat_history)
        
    def generate_stream(self, system_prompt: str, user_prompt: str, chat_history: List[Dict[str, str]] = None) -> Generator[str, None, None]:
        yield from MockProvider().generate_stream(system_prompt, user_prompt, chat_history)


class GeminiProvider(ModelProvider):
    def generate(self, system_prompt: str, user_prompt: str, chat_history: List[Dict[str, str]] = None) -> str:
        return MockProvider().generate(system_prompt, user_prompt, chat_history)
        
    def generate_stream(self, system_prompt: str, user_prompt: str, chat_history: List[Dict[str, str]] = None) -> Generator[str, None, None]:
        yield from MockProvider().generate_stream(system_prompt, user_prompt, chat_history)


class DeepSeekProvider(ModelProvider):
    def generate(self, system_prompt: str, user_prompt: str, chat_history: List[Dict[str, str]] = None) -> str:
        return MockProvider().generate(system_prompt, user_prompt, chat_history)
        
    def generate_stream(self, system_prompt: str, user_prompt: str, chat_history: List[Dict[str, str]] = None) -> Generator[str, None, None]:
        yield from MockProvider().generate_stream(system_prompt, user_prompt, chat_history)
