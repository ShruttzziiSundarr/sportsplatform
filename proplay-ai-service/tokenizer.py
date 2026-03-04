"""
Proplay AthleteTokenizer — Character-level tokenizer for athletic performance data.

Encodes metric records into token ID sequences consumable by MiniGPT.

Input format produced by format_metrics():
    "SPEED:075 STRENGTH:082 STAMINA:068 TACTICAL:071 | SPEED:080 STRENGTH:085 ..."

Character vocabulary:
    Special tokens [PAD], [START], [END], [SEP]
    + digits 0-9
    + uppercase letters A-Z
    + punctuation: colon ':', space ' ', pipe '|'
"""

from __future__ import annotations


class AthleteTokenizer:
    """
    Character-level tokenizer tailored for athlete performance strings.

    Special tokens
    --------------
    [PAD]   ID 0  – padding token (fills sequences to block_size)
    [START] ID 1  – beginning-of-sequence marker
    [END]   ID 2  – end-of-sequence marker
    [SEP]   ID 3  – separator between performance records (maps to '|')
    """

    _SPECIAL: list[str] = ["[PAD]", "[START]", "[END]", "[SEP]"]

    # Characters that can appear in metric strings
    _CHAR_SET: str = (
        "0123456789"
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        ": |."
    )

    def __init__(self) -> None:
        # Special token → ID
        self.special_to_idx: dict[str, int] = {
            tok: idx for idx, tok in enumerate(self._SPECIAL)
        }
        offset = len(self._SPECIAL)

        # Character → ID (offset by number of special tokens)
        chars = sorted(set(self._CHAR_SET))
        self.char_to_idx: dict[str, int] = {
            ch: idx + offset for idx, ch in enumerate(chars)
        }

        # ID → character (for decoding)
        self.idx_to_char: dict[int, str] = {
            v: k for k, v in self.char_to_idx.items()
        }
        # Also map special token IDs back to their string representations
        for tok, idx in self.special_to_idx.items():
            self.idx_to_char[idx] = tok

        self.vocab_size: int = len(chars) + len(self._SPECIAL)

        # Convenience aliases
        self.pad_id: int   = self.special_to_idx["[PAD]"]
        self.start_id: int = self.special_to_idx["[START]"]
        self.end_id: int   = self.special_to_idx["[END]"]
        self.sep_id: int   = self.special_to_idx["[SEP]"]

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def encode(self, text: str) -> list[int]:
        """
        Encode a metrics string into a list of token IDs.

        The sequence is wrapped with [START] … [END] markers.
        Unknown characters are silently dropped.

        Args:
            text: Raw metrics string (will be uppercased internally).

        Returns:
            List of integer token IDs.
        """
        ids: list[int] = [self.start_id]
        for ch in text.upper():
            if ch in self.char_to_idx:
                ids.append(self.char_to_idx[ch])
            # Unknown characters are skipped
        ids.append(self.end_id)
        return ids

    def decode(self, ids: list[int]) -> str:
        """
        Decode a list of token IDs back into a human-readable string.

        Special tokens [PAD], [START], [END] are stripped from the output;
        [SEP] is rendered as '|'.

        Args:
            ids: List of integer token IDs.

        Returns:
            Decoded string.
        """
        chars: list[str] = []
        skip = {self.pad_id, self.start_id, self.end_id}
        for idx in ids:
            if idx in skip:
                continue
            if idx == self.sep_id:
                chars.append("|")
            elif idx in self.idx_to_char:
                chars.append(self.idx_to_char[idx])
        return "".join(chars)

    def encode_and_pad(self, text: str, block_size: int) -> list[int]:
        """
        Encode and pad (or truncate) to exactly `block_size` tokens.

        Args:
            text:       Raw metrics string.
            block_size: Target sequence length.

        Returns:
            List of exactly `block_size` token IDs.
        """
        ids = self.encode(text)
        if len(ids) > block_size:
            ids = ids[:block_size]
        else:
            ids += [self.pad_id] * (block_size - len(ids))
        return ids

    # ------------------------------------------------------------------
    # Static helper
    # ------------------------------------------------------------------

    @staticmethod
    def format_metrics(metrics_list: list[dict]) -> str:
        """
        Serialise a list of metric dicts into a tokenisable string.

        Each record is formatted as:
            "SPEED:075 STRENGTH:082 STAMINA:068 TACTICAL:071"

        Records are separated by " | " (a single space on each side).

        Args:
            metrics_list: List of dicts with keys speed, strength, stamina, tactical.

        Returns:
            Single string representation of the full performance history.

        Example:
            >>> AthleteTokenizer.format_metrics([
            ...     {"speed": 75, "strength": 82, "stamina": 68, "tactical": 71}
            ... ])
            'SPEED:075 STRENGTH:082 STAMINA:068 TACTICAL:071'
        """
        records: list[str] = []
        for m in metrics_list:
            record = (
                f"SPEED:{int(m.get('speed', 0)):03d} "
                f"STRENGTH:{int(m.get('strength', 0)):03d} "
                f"STAMINA:{int(m.get('stamina', 0)):03d} "
                f"TACTICAL:{int(m.get('tactical', 0)):03d}"
            )
            records.append(record)
        return " | ".join(records)
