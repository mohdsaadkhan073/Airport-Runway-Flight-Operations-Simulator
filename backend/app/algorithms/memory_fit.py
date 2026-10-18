from typing import List, Dict, Any, Optional


def find_block_first_fit(free_blocks: List[Dict[str, Any]], requested_size: int) -> Optional[int]:
    for idx, block in enumerate(free_blocks):
        if block["size"] >= requested_size:
            return idx
    return None


def find_block_best_fit(free_blocks: List[Dict[str, Any]], requested_size: int) -> Optional[int]:
    best_idx = None
    min_leftover = float("inf")
    for idx, block in enumerate(free_blocks):
        if block["size"] >= requested_size:
            leftover = block["size"] - requested_size
            if leftover < min_leftover:
                min_leftover = leftover
                best_idx = idx
    return best_idx


def find_block_worst_fit(free_blocks: List[Dict[str, Any]], requested_size: int) -> Optional[int]:
    worst_idx = None
    max_leftover = -1
    for idx, block in enumerate(free_blocks):
        if block["size"] >= requested_size:
            leftover = block["size"] - requested_size
            if leftover > max_leftover:
                max_leftover = leftover
                worst_idx = idx
    return worst_idx
