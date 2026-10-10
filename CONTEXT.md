# Orbi

A coding agent that runs in the terminal, built by one person to learn how coding agents work and to use every day.

## Language

**Orbi**:
The agent itself, named after the AI companion in the Melo mascot sheet. Melo is the developer and Orbi is the tool Melo built.
_Avoid_: the harness, the bot, the assistant

**Sbire**:
A subagent: a short-lived agent with its own fresh context that Orbi sends to do one task and report back.
_Avoid_: subagent, worker, child agent

**Turn**:
Everything that happens between the user sending a prompt and Orbi's final answer. A turn usually contains several requests.
_Avoid_: exchange, round

**Request**:
One call to the model API inside a turn. A turn ends when a request comes back without asking for a tool.
_Avoid_: call, step, iteration

**Event**:
A typed piece of data the core emits while a turn runs (text, thinking, tool call, tool result, notice, turn end). UIs and the eval runner only see events.
_Avoid_: message, log line

**Mood**:
One of Orbi's visible states from the mascot sheet (idle, thinking, analyzing, celebrating, alert), shown in the UI to reflect what the agent is doing.
_Avoid_: status, spinner
