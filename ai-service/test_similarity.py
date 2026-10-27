"""
Unit and Integration Test for FYP AI Similarity Microservice
"""
import sys
import os

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.schemas import ProjectItem
from app.similarity import SimilarityService

def run_tests():
    print("====================================================")
    print("      TESTING SENTENCE-TRANSFORMERS SIMILARITY      ")
    print("====================================================\n")

    service = SimilarityService(model_name="all-MiniLM-L6-v2")
    passed = 0
    total = 0

    def check(condition, test_name, detail=""):
        nonlocal passed, total
        total += 1
        if condition:
            passed += 1
            print(f"✅ [PASS] {test_name}")
        else:
            print(f"❌ [FAIL] {test_name} - {detail}")

    # Sample archive of completed FYP projects
    past_projects = [
        ProjectItem(
            id="proj-01",
            title="Automated Drone Surveillance and Real-time Object Tracking",
            abstract="Using YOLO deep learning models and edge computer vision on drones for airspace surveillance and intruder detection.",
            year=2023,
            domain="Computer Vision & Robotics",
            technologies=["Python", "YOLOv8", "OpenCV", "ROS"],
        ),
        ProjectItem(
            id="proj-02",
            title="Decentralized Electronic Voting System Using Blockchain",
            abstract="A transparent and tamper-proof voting platform utilizing Ethereum smart contracts and biometric verification.",
            year=2024,
            domain="Blockchain & Security",
            technologies=["Solidity", "React", "Node.js", "Web3"],
        ),
        ProjectItem(
            id="proj-03",
            title="E-Commerce Fashion Recommender System",
            abstract="Collaborative filtering and visual embeddings to recommend clothing items to shoppers based on preferences.",
            year=2022,
            domain="Web & Recommender Systems",
            technologies=["Django", "TensorFlow", "React"],
        ),
    ]

    # Test 1: Highly similar proposal (should trigger warning > 70%)
    similar_proposal_title = "Autonomous Drone Surveillance and Target Tracking System"
    similar_proposal_abstract = "We propose an autonomous drone surveillance system leveraging YOLO for real-time intruder tracking in restricted areas."

    res1 = service.check_similarity(
        title=similar_proposal_title,
        abstract=similar_proposal_abstract,
        previous_projects=past_projects,
        threshold=70.0,
    )

    check(
        res1.max_similarity > 70.0,
        "1. Highly similar proposal scores above 70% threshold",
        f"Score: {res1.max_similarity}%"
    )
    check(
        res1.has_warning is True,
        "2. Warning flag correctly set to True for similarity > 70%"
    )
    check(
        res1.top_matches[0].id == "proj-01",
        "3. Correct most-similar historical project identified as rank 1",
        f"Top match: {res1.top_matches[0].title}"
    )

    # Test 2: Novel/unrelated proposal (should NOT trigger warning)
    novel_title = "Quantum Cryptography for Secure Satellite Communications"
    novel_abstract = "Implementing Quantum Key Distribution (QKD) BB84 protocols to protect low-earth orbit satellite links against quantum decryption."

    res2 = service.check_similarity(
        title=novel_title,
        abstract=novel_abstract,
        previous_projects=past_projects,
        threshold=70.0,
    )

    check(
        res2.max_similarity < 50.0,
        "4. Novel proposal receives low similarity score (< 50%)",
        f"Score: {res2.max_similarity}%"
    )
    check(
        res2.has_warning is False,
        "5. Warning flag correctly set to False for novel proposal"
    )

    # Test 3: Cache verification
    initial_cache_size = len(service.embedding_cache)
    # Re-running same check should not increase cache size
    _ = service.check_similarity(
        title=similar_proposal_title,
        abstract=similar_proposal_abstract,
        previous_projects=past_projects,
        threshold=70.0,
    )
    check(
        len(service.embedding_cache) == initial_cache_size,
        "6. Embedding cache hits without redundant re-computations"
    )

    # Test 4: Top matches length constraint
    check(
        len(res1.top_matches) <= 5,
        "7. Top matches list capped at maximum 5 results"
    )

    print(f"\n====================================================")
    print(f"RESULTS: {passed} / {total} tests passed ({round((passed/total)*100)}%)")
    print(f"====================================================")

    if passed != total:
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
