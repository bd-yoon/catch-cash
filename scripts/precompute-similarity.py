"""
단어 유사도 사전 계산 스크립트 (꼬맨틀 방식)

사전 조건:
  pip install gensim numpy

FastText 한국어 벡터 다운로드 (약 4.8GB):
  wget https://dl.fbaipublicfiles.com/fasttext/vectors-crawl/cc.ko.300.bin.gz
  gunzip cc.ko.300.bin.gz

사용법:
  python scripts/precompute-similarity.py \
    --model cc.ko.300.bin \
    --words scripts/word-pool.txt \
    --outdir data/words \
    --topk 1000

출력:
  data/words/{단어}.json  → { "유사단어": 점수(0-100), ... }
"""

import argparse
import json
import math
import os
from pathlib import Path


def cosine_to_score(similarity: float) -> int:
    """
    코사인 유사도(-1~1) → 게임 점수(0~100)
    꼬맨틀 방식: 유사도 0.0 이하 → 0점, 1.0 → 100점
    선형 스케일링
    """
    clamped = max(0.0, min(1.0, similarity))
    return round(clamped * 100)


def precompute(model_path: str, words: list[str], outdir: str, topk: int = 1000):
    try:
        import gensim
        from gensim.models import KeyedVectors
    except ImportError:
        print("ERROR: pip install gensim")
        return

    print(f"Loading FastText model from {model_path} ...")
    model = KeyedVectors.load_word2vec_format(model_path, binary=True)
    print("Model loaded.")

    os.makedirs(outdir, exist_ok=True)

    for word in words:
        out_path = Path(outdir) / f"{word}.json"
        if out_path.exists():
            print(f"  skip {word} (already exists)")
            continue

        if word not in model:
            print(f"  skip {word} (not in vocab)")
            # 빈 파일 생성 (정답만 가능)
            out_path.write_text("{}", encoding="utf-8")
            continue

        try:
            similar = model.most_similar(word, topn=topk)
        except Exception as e:
            print(f"  error {word}: {e}")
            out_path.write_text("{}", encoding="utf-8")
            continue

        result: dict[str, int] = {}
        for sim_word, sim_score in similar:
            score = cosine_to_score(sim_score)
            if score > 0:
                result[sim_word] = score

        out_path.write_text(json.dumps(result, ensure_ascii=False), encoding="utf-8")
        print(f"  ✓ {word} → {len(result)} entries (max score: {max(result.values()) if result else 0})")

    print(f"\nDone. Files written to {outdir}/")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model",  required=True, help="Path to cc.ko.300.bin")
    parser.add_argument("--words",  required=True, help="Text file, one word per line")
    parser.add_argument("--outdir", default="data/words")
    parser.add_argument("--topk",   type=int, default=1000)
    args = parser.parse_args()

    with open(args.words, encoding="utf-8") as f:
        words = [line.strip() for line in f if line.strip()]

    precompute(args.model, words, args.outdir, args.topk)


if __name__ == "__main__":
    main()
