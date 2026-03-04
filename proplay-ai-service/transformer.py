"""
Proplay MiniGPT — Decoder-only Transformer for Athletic Scout Intelligence
Architecture follows the Raschka LLMs-from-scratch methodology.

Components:
  - GPTConfig        : Hyperparameter dataclass
  - CausalSelfAttention : Masked multi-head self-attention
  - MLP              : Feed-forward block with GeLU activation
  - Block            : Full transformer block (pre-norm residual)
  - MiniGPT          : Complete GPT-style model
"""

import math
from dataclasses import dataclass

import torch
import torch.nn as nn
from torch.nn import functional as F


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

@dataclass
class GPTConfig:
    """Hyperparameters for the MiniGPT scout model."""
    block_size: int = 64      # Maximum sequence length (tokens)
    vocab_size: int = 50      # Set at runtime by AthleteTokenizer.vocab_size
    n_layer: int = 4          # Number of transformer blocks
    n_head: int = 4           # Number of attention heads
    n_embd: int = 128         # Embedding / hidden dimension
    dropout: float = 0.1      # Dropout probability


# ---------------------------------------------------------------------------
# Causal (masked) Multi-Head Self-Attention
# ---------------------------------------------------------------------------

class CausalSelfAttention(nn.Module):
    """
    Multi-head self-attention with a causal (lower-triangular) mask.
    The causal mask ensures the scout model can only attend to past tokens —
    matching the temporal ordering of an athlete's performance history.
    """

    def __init__(self, config: GPTConfig):
        super().__init__()
        assert config.n_embd % config.n_head == 0, (
            "n_embd must be divisible by n_head"
        )
        self.n_head = config.n_head
        self.n_embd = config.n_embd
        self.head_dim = config.n_embd // config.n_head

        # Combined QKV projection (efficiency trick from GPT-2)
        self.c_attn = nn.Linear(config.n_embd, 3 * config.n_embd)
        # Output projection
        self.c_proj = nn.Linear(config.n_embd, config.n_embd)

        self.attn_dropout = nn.Dropout(config.dropout)
        self.resid_dropout = nn.Dropout(config.dropout)

        # Causal mask: lower triangle = 1 (allowed), upper = 0 (masked)
        # Registered as a non-parameter buffer so it moves with .to(device)
        self.register_buffer(
            "mask",
            torch.tril(torch.ones(config.block_size, config.block_size))
            .view(1, 1, config.block_size, config.block_size),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        B, T, C = x.size()  # Batch, sequence length, embedding dim

        # 1. Compute Q, K, V from combined projection
        qkv = self.c_attn(x)                          # (B, T, 3*C)
        q, k, v = qkv.split(self.n_embd, dim=2)       # each (B, T, C)

        # 2. Reshape for multi-head attention: (B, n_head, T, head_dim)
        q = q.view(B, T, self.n_head, self.head_dim).transpose(1, 2)
        k = k.view(B, T, self.n_head, self.head_dim).transpose(1, 2)
        v = v.view(B, T, self.n_head, self.head_dim).transpose(1, 2)

        # 3. Scaled dot-product attention: (B, n_head, T, T)
        scale = math.sqrt(self.head_dim)
        att = (q @ k.transpose(-2, -1)) / scale

        # 4. Apply causal mask — future positions become -inf → zero after softmax
        att = att.masked_fill(self.mask[:, :, :T, :T] == 0, float("-inf"))
        att = F.softmax(att, dim=-1)
        att = self.attn_dropout(att)

        # 5. Weighted sum of values: (B, n_head, T, head_dim)
        y = att @ v

        # 6. Re-assemble heads and apply output projection
        y = y.transpose(1, 2).contiguous().view(B, T, C)
        y = self.resid_dropout(self.c_proj(y))
        return y


# ---------------------------------------------------------------------------
# Feed-Forward Network (MLP) with GeLU
# ---------------------------------------------------------------------------

class MLP(nn.Module):
    """
    Position-wise feed-forward network.
    Uses a 4× expansion factor and GeLU activation (same as GPT-2).
    """

    def __init__(self, config: GPTConfig):
        super().__init__()
        self.fc1 = nn.Linear(config.n_embd, 4 * config.n_embd)
        self.gelu = nn.GELU()
        self.fc2 = nn.Linear(4 * config.n_embd, config.n_embd)
        self.dropout = nn.Dropout(config.dropout)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.dropout(self.fc2(self.gelu(self.fc1(x))))


# ---------------------------------------------------------------------------
# Transformer Block
# ---------------------------------------------------------------------------

class Block(nn.Module):
    """
    Single transformer block: Pre-LayerNorm → Attention + Pre-LayerNorm → MLP.
    Residual connections around both sub-layers (same pattern as GPT-2).
    """

    def __init__(self, config: GPTConfig):
        super().__init__()
        self.ln1 = nn.LayerNorm(config.n_embd)
        self.attn = CausalSelfAttention(config)
        self.ln2 = nn.LayerNorm(config.n_embd)
        self.mlp = MLP(config)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = x + self.attn(self.ln1(x))   # residual around attention
        x = x + self.mlp(self.ln2(x))    # residual around MLP
        return x


# ---------------------------------------------------------------------------
# MiniGPT — Full Decoder-only Model
# ---------------------------------------------------------------------------

class MiniGPT(nn.Module):
    """
    Decoder-only Transformer for athletic performance analysis.

    Input  : Token IDs representing a sequence of athlete metric records.
    Output : Per-token logits over the vocabulary AND the final hidden states.

    The final hidden states are used by the scout report decoder to
    extract contextual feature signals from the performance trajectory.
    """

    def __init__(self, config: GPTConfig):
        super().__init__()
        self.config = config

        self.transformer = nn.ModuleDict({
            # Token embedding: maps vocab → n_embd
            "wte": nn.Embedding(config.vocab_size, config.n_embd),
            # Positional embedding: maps position → n_embd
            "wpe": nn.Embedding(config.block_size, config.n_embd),
            "drop": nn.Dropout(config.dropout),
            # Stack of transformer blocks
            "h": nn.ModuleList([Block(config) for _ in range(config.n_layer)]),
            # Final layer normalisation
            "ln_f": nn.LayerNorm(config.n_embd),
        })

        # Language model head: hidden → vocab logits
        self.lm_head = nn.Linear(config.n_embd, config.vocab_size, bias=False)

        # Weight tying: share token embedding and lm_head weights (GPT convention)
        self.transformer["wte"].weight = self.lm_head.weight

        # Initialise all parameters
        self.apply(self._init_weights)

    # ------------------------------------------------------------------
    # Weight Initialisation (Raschka-style: N(0, 0.02))
    # ------------------------------------------------------------------

    def _init_weights(self, module: nn.Module) -> None:
        if isinstance(module, nn.Linear):
            nn.init.normal_(module.weight, mean=0.0, std=0.02)
            if module.bias is not None:
                nn.init.zeros_(module.bias)
        elif isinstance(module, nn.Embedding):
            nn.init.normal_(module.weight, mean=0.0, std=0.02)
        elif isinstance(module, nn.LayerNorm):
            nn.init.zeros_(module.bias)
            nn.init.ones_(module.weight)

    # ------------------------------------------------------------------
    # Forward Pass
    # ------------------------------------------------------------------

    def forward(
        self, idx: torch.Tensor
    ) -> tuple[torch.Tensor, torch.Tensor]:
        """
        Args:
            idx: LongTensor of shape (B, T) — token IDs.

        Returns:
            logits      : (B, T, vocab_size) — next-token prediction scores.
            hidden_states: (B, T, n_embd)   — final transformer hidden states.
        """
        B, T = idx.size()
        assert T <= self.config.block_size, (
            f"Sequence length {T} exceeds block_size {self.config.block_size}"
        )

        pos = torch.arange(T, device=idx.device)  # (T,)

        # Token + positional embeddings
        tok_emb = self.transformer["wte"](idx)     # (B, T, n_embd)
        pos_emb = self.transformer["wpe"](pos)     # (T, n_embd)
        x = self.transformer["drop"](tok_emb + pos_emb)

        # Pass through all transformer blocks
        for block in self.transformer["h"]:
            x = block(x)

        # Final layer normalisation
        hidden_states = self.transformer["ln_f"](x)

        # Project to vocabulary
        logits = self.lm_head(hidden_states)

        return logits, hidden_states

    # ------------------------------------------------------------------
    # Inference Utility
    # ------------------------------------------------------------------

    def get_hidden_state(self, idx: torch.Tensor) -> torch.Tensor:
        """
        Run a forward pass and return the mean-pooled final hidden state.

        This vector encodes the contextual summary of the entire athlete
        performance sequence — used by the scout report decoder.

        Args:
            idx: LongTensor (B, T)

        Returns:
            Tensor (B, n_embd) — pooled hidden state per sequence.
        """
        with torch.no_grad():
            _, hidden = self.forward(idx)
        return hidden.mean(dim=1)  # Mean-pool over sequence → (B, n_embd)
