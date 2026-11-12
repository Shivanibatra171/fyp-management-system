try {
  require('dns').setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const { PreviousFYP, Proposal, Project, User } = require('../models');

// Curated list of authentic FYP projects from user's provided catalog
const userProjectsCorpus = [
  {
    title: 'SIBAU-FYP Portal',
    abstract: 'A centralized university web portal for coordinating final year projects, managing the complete proposal submission lifecycle, milestone evaluation deliverables, supervisor allocation, and automated AI similarity detection.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Khursheed Ahmed',
    studentNames: ['Ali Ahmed', 'Bilal Khan'],
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'TailwindCSS', 'JWT'],
    grade: 'A+',
  },
  {
    title: 'RapidReach – Smart Emergency Assistant',
    abstract: 'An IoT and mobile emergency response coordinator that detects vehicular collisions using accelerometer thresholding and automatically dispatches GPS coordinates to rescue services and family contacts.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Fahad Siddiqui',
    studentNames: ['Omer Farooq', 'Usman Tariq'],
    technologies: ['Flutter', 'ESP32', 'Firebase', 'Google Maps API', 'C++'],
    grade: 'A+',
  },
  {
    title: 'SmartLens: An AI-Powered CCTV Surveillance and Storage Optimization',
    abstract: 'An edge computer vision surveillance system that detects moving human and vehicle subjects using background subtraction and YOLOv8, recording high-resolution clips only during activity to save 80% NVR storage bandwidth.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Asif Nawaz',
    studentNames: ['Hamza Malik', 'Zainab Fatima'],
    technologies: ['Python', 'OpenCV', 'YOLOv8', 'RTSP', 'Flask', 'Docker'],
    grade: 'A',
  },
  {
    title: 'IntelliHire: Intelligent Recruitment and Interview Automation System',
    abstract: 'An end-to-end AI hiring platform that parses candidate resumes using NLP, conducts asynchronous video interviews, and evaluates candidate speech fluency, sentiment, and technical relevance.',
    domain: 'Software Engineering',
    year: 2024,
    supervisorName: 'Dr. Amna Farooq',
    studentNames: ['Sara Noor', 'Hina Riaz'],
    technologies: ['Python', 'React', 'FastAPI', 'Whisper', 'Spacy', 'PostgreSQL'],
    grade: 'A',
  },
  {
    title: 'Prayer Posture Validator',
    abstract: 'A real-time computer vision application utilizing MediaPipe pose estimation to track joint angles during Islamic prayer (Salah) postures, providing non-intrusive auditory guidance for proper alignment.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Zafar Iqbal',
    studentNames: ['Mustafa Kamal', 'Ahmed Raza'],
    technologies: ['Python', 'MediaPipe', 'OpenCV', 'PyTorch', 'Flutter'],
    grade: 'A+',
  },
  {
    title: 'Sindhi Sign Connect',
    abstract: 'A bidirectional assistive communication platform converting regional Sindhi sign gestures captured via camera into spoken and written Sindhi text using deep spatial-temporal LSTM networks.',
    domain: 'Computer System Engineering',
    year: 2023,
    supervisorName: 'Dr. Sana Mir',
    studentNames: ['Teesha Kumari', 'Kashif Ali'],
    technologies: ['PyTorch', 'MediaPipe', 'OpenCV', 'Python', 'React Native'],
    grade: 'A+',
  },
  {
    title: 'AI-Augmented SCADA for smarter power grids',
    abstract: 'An intelligent telemetry and predictive fault detection module for electrical distribution substations, integrating Modbus RTU polling with autoencoders to forecast transformer thermal overloads.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Khursheed Ahmed',
    studentNames: ['Farhan Siddiqui', 'Saad Ahmed'],
    technologies: ['Python', 'Scada-LTS', 'PyTorch', 'Modbus', 'InfluxDB', 'Grafana'],
    grade: 'A+',
  },
  {
    title: 'Smart Blind Spot Detection & Alert System using Raspberry Pi and Computer Vision',
    abstract: 'An automotive active safety device mounted on commercial heavy vehicles using dual wide-angle camera feeds and MobileNet SSD to issue instant haptic and acoustic warnings when vehicles enter blind angles.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Asif Nawaz',
    studentNames: ['Waleed Khan', 'Daniyal Qureshi'],
    technologies: ['Raspberry Pi 4', 'OpenCV', 'TensorFlow Lite', 'Python', 'GPIO'],
    grade: 'A',
  },
  {
    title: 'AlzCare: A Smart Companion App for Alzheimer\'s Patients, Supporting Caregivers and Doctors',
    abstract: 'An assistive mobile care companion featuring face recognition for familiar relatives, geofencing GPS wander alerts, automated medication schedule reminders, and cognitive memory stimulation mini-games.',
    domain: 'Software Engineering',
    year: 2023,
    supervisorName: 'Dr. Nadia Rehman',
    studentNames: ['Ayesha Malik', 'Fatima Jamil'],
    technologies: ['Flutter', 'Firebase', 'TensorFlow Lite', 'Node.js', 'Cloud Firestore'],
    grade: 'A',
  },
  {
    title: 'PathNet: Smart Pothole Detection and Alert EcoSystem',
    abstract: 'A crowd-sourced road quality monitoring system utilizing smartphone IMU accelerometer spikes and dashcam vision to map road potholes with GPS coordinates on a municipal GIS dashboard.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Rabia Basri',
    studentNames: ['Babar Azam', 'Rizwan Qasim'],
    technologies: ['React Native', 'Python', 'YOLOv8', 'Flask', 'Mapbox', 'MongoDB'],
    grade: 'A',
  },
  {
    title: 'AI-Enabled E-Assessment of Close-Ended Questions on OMR Sheets',
    abstract: 'A robust optical mark recognition (OMR) system using perspective warping, Hough circle transform, and contour thresholding to evaluate 100-question answer sheets at 60 sheets/minute with 99.8% accuracy.',
    domain: 'Computer System Engineering',
    year: 2023,
    supervisorName: 'Dr. Fahad Siddiqui',
    studentNames: ['Zeeshan Haider', 'Noman Bashir'],
    technologies: ['Python', 'OpenCV', 'NumPy', 'React', 'Node.js'],
    grade: 'A+',
  },
  {
    title: 'IntelliLearn: Adaptive AI Platform for Smarter Studying and Success Using RAG',
    abstract: 'A personalized academic learning environment that indexes university course syllabi and textbooks into FAISS vector stores to provide cited answers, flashcards, and adaptive practice exams via Llama-3.',
    domain: 'Computer Science',
    year: 2024,
    supervisorName: 'Dr. Tariq Mahmood',
    studentNames: ['Danish Taimoor', 'Kinza Hashmi'],
    technologies: ['Python', 'LangChain', 'FAISS', 'FastAPI', 'React', 'TailwindCSS'],
    grade: 'A+',
  },
  {
    title: 'DeepFakeGuard',
    abstract: 'A multimodal forensic deepfake verification tool analyzing spatial facial boundary artifacts and temporal eye-blink frequency inconsistencies using MesoNet and XceptionNet architectures.',
    domain: 'Computer Science',
    year: 2024,
    supervisorName: 'Dr. Kashif Mehmood',
    studentNames: ['Arsalan Iftikhar', 'Mehwish Hayat'],
    technologies: ['PyTorch', 'OpenCV', 'Flask', 'React', 'FFmpeg'],
    grade: 'A+',
  },
  {
    title: 'Virtual Outfit Try On Application Using AI',
    abstract: 'A generative AI virtual dressing room using conditional generative adversarial networks (CP-VTON) to realistically drape target clothing garments onto user uploaded full-body photographs.',
    domain: 'Computer Science',
    year: 2024,
    supervisorName: 'Dr. Imran Ali',
    studentNames: ['Saba Karim', 'Anum Saeed'],
    technologies: ['PyTorch', 'GANs', 'OpenCV', 'Python', 'React', 'FastAPI'],
    grade: 'A',
  },
  {
    title: 'FixRight ( A Local Freelance Service Platform for Domestic Workers)',
    abstract: 'A localized marketplace connecting households with verified plumbers, electricians, and carpenters in provincial cities with fair pricing matrix, bilingual voice search, and in-app escrow payments.',
    domain: 'Software Engineering',
    year: 2023,
    supervisorName: 'Dr. Nadia Rehman',
    studentNames: ['Fahad Mustafa', 'Iqra Aziz'],
    technologies: ['Node.js', 'Express', 'React Native', 'MongoDB', 'Stripe API'],
    grade: 'A',
  },
  {
    title: 'Agentic Social Manager',
    abstract: 'An autonomous multi-agent social media orchestrator leveraging LLM function calling to generate scheduled content calendars, synthesize topical image banners, and draft replies to customer inquiries.',
    domain: 'Computer Science',
    year: 2024,
    supervisorName: 'Dr. Kashif Mehmood',
    studentNames: ['Shahzad Noor', 'Nimra Khan'],
    technologies: ['Python', 'LangGraph', 'OpenAI API', 'FastAPI', 'Next.js'],
    grade: 'A',
  },
  {
    title: 'Smart CDR Analyzer',
    abstract: 'A big data forensic analytics tool for law enforcement agencies to ingest millions of telecom Call Detail Records (CDR), compute geospatial co-location, identify IMEI changes, and map communication graphs.',
    domain: 'Computer Science',
    year: 2023,
    supervisorName: 'Dr. Tariq Mahmood',
    studentNames: ['Yasir Hussain', 'Alizeh Shah'],
    technologies: ['Python', 'Pandas', 'NetworkX', 'Neo4j', 'React', 'D3.js'],
    grade: 'A+',
  },
  {
    title: 'IntelliClaim: AI powered Car damage Assessment for Insurance Claims',
    abstract: 'An automated motor insurance underwriting portal analyzing damage photos using instance segmentation (Mask R-CNN) to classify dent, scratch, and panel severity with instant repair cost estimations.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Asif Nawaz',
    studentNames: ['Mahnoor Shah', 'Haris Rauf'],
    technologies: ['PyTorch', 'Mask R-CNN', 'FastAPI', 'React', 'Docker'],
    grade: 'A',
  },
  {
    title: 'AI-Based Facial Recognition System For Automated Entry in Testing Centers',
    abstract: 'A high-throughput biometric authentication kiosk designed for entry verification at STS examination halls to eliminate candidate impersonation using InsightFace and anti-spoof liveness detection.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Khursheed Ahmed',
    studentNames: ['Ali Ahmed', 'Maryam Nawaz'],
    technologies: ['Python', 'InsightFace', 'OpenCV', 'PyTorch', 'React', 'SQLite'],
    grade: 'A+',
  },
  {
    title: 'A Unified Information Portal for the Sindh Universities and Boards Department',
    abstract: 'An integrated governance and monitoring portal synchronizing academic calendars, examination results, charter accreditations, and public university grant disbursements across Sindh province.',
    domain: 'Software Engineering',
    year: 2023,
    supervisorName: 'Dr. Amna Farooq',
    studentNames: ['Hamza Tariq', 'Sara Noor'],
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'Redis'],
    grade: 'A',
  },
  {
    title: 'Automated Bubble Sheet and Essay Evaluation System',
    abstract: 'A hybrid assessment platform evaluating both objective bubble sheets via computer vision and subjective handwritten essays using OCR, semantic sentence transformers, and automated coherence scoring.',
    domain: 'Computer Science',
    year: 2024,
    supervisorName: 'Dr. Tariq Mahmood',
    studentNames: ['Daniyal Qureshi', 'Usman Ghani'],
    technologies: ['Python', 'OpenCV', 'HuggingFace', 'FastAPI', 'React'],
    grade: 'A+',
  },
  {
    title: 'VoiceMentor: An AI-Based Wearable for Instant Language Feedback and Learning',
    abstract: 'An embedded Bluetooth pendant capturing user spoken English phonetics, processing speech locally via Whisper.tflite, and giving real-time bone-conduction haptic feedback on mispronounced vowel sounds.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Fahad Siddiqui',
    studentNames: ['Zainab Fatima', 'Mustafa Kamal'],
    technologies: ['Raspberry Pi Zero', 'Whisper', 'Python', 'BLE', 'TensorFlow Lite'],
    grade: 'A',
  },
  {
    title: 'AI Based IELTS Mock Test',
    abstract: 'A comprehensive online IELTS test simulator that delivers automated band scores for Speaking (pronunciation, fluency) and Writing (lexical resource, task response) according to Cambridge grading rubric.',
    domain: 'Software Engineering',
    year: 2024,
    supervisorName: 'Dr. Nadia Rehman',
    studentNames: ['Fahad Mustafa', 'Sara Noor'],
    technologies: ['React', 'Node.js', 'Python', 'Whisper', 'RoBERTa', 'MongoDB'],
    grade: 'A',
  },
  {
    title: 'Retinal blood vessels segmentation based on transformer model for early eyes diseases detection',
    abstract: 'A medical diagnostic imaging pipeline using Swin Transformer and UNet++ architectures to segment microvascular retinal structures on fundus images for early diabetic retinopathy screening.',
    domain: 'Computer System Engineering',
    year: 2023,
    supervisorName: 'Dr. Asif Nawaz',
    studentNames: ['Sarmad Ali', 'Nida Fatima'],
    technologies: ['PyTorch', 'TorchVision', 'OpenCV', 'Streamlit', 'Python'],
    grade: 'A+',
  },
  {
    title: 'Civic Eye',
    abstract: 'A municipal public grievance app allowing citizens to report sanitation, broken streetlights, and drainage issues with geotagged photos, routing complaints automatically to concerned district departments.',
    domain: 'Software Engineering',
    year: 2024,
    supervisorName: 'Dr. Amna Farooq',
    studentNames: ['Hamza Malik', 'Omer Farooq'],
    technologies: ['React Native', 'Node.js', 'Express', 'MongoDB', 'Google Cloud Vision'],
    grade: 'A',
  },
  {
    title: 'Real-Time Meeting Summarizer with Per-Participant Voice Recording',
    abstract: 'An automated boardroom transcription engine employing speaker diarization (pyannote.audio) and LLM summarization to generate actionable minutes, owner assignments, and key decisions.',
    domain: 'Computer Science',
    year: 2024,
    supervisorName: 'Dr. Kashif Mehmood',
    studentNames: ['Danish Taimoor', 'Arsalan Iftikhar'],
    technologies: ['Python', 'pyannote.audio', 'Whisper', 'LangChain', 'React'],
    grade: 'A',
  },
  {
    title: 'NeuroEmotion- Brain Wave Interpretation for Emotion Analysis',
    abstract: 'An EEG signal processing system classifying valence and arousal emotional states across DEAP dataset using continuous wavelet transform and multi-layer convolutional networks.',
    domain: 'Computer System Engineering',
    year: 2023,
    supervisorName: 'Dr. Zafar Iqbal',
    studentNames: ['Babar Azam', 'Mahnoor Shah'],
    technologies: ['Python', 'MNE-Python', 'SciPy', 'PyTorch', 'Qt'],
    grade: 'A+',
  },
  {
    title: 'CampusConnect – Scholarship & Career Opportunity Portal',
    abstract: 'An automated scholarship aggregation and internship matchmaking platform filtering opportunities based on student GPA, departmental discipline, and financial background with deadline reminders.',
    domain: 'Software Engineering',
    year: 2024,
    supervisorName: 'Engr. Madiha Javed',
    studentNames: ['Yasir Hussain', 'Shahzad Noor'],
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'TailwindCSS'],
    grade: 'A',
  },
  {
    title: 'AI-Enabled Automated Trading Platform for Binance Futures',
    abstract: 'An algorithmic crypto derivatives trading system utilizing XGBoost and technical indicators (MACD, RSI, Bollinger Bands) to execute low-latency order routing with automated stop-loss risk management.',
    domain: 'Computer Science',
    year: 2024,
    supervisorName: 'Dr. Tariq Mahmood',
    studentNames: ['Sara Noor', 'Ali Raza'],
    technologies: ['Python', 'CCXT', 'Pandas', 'FastAPI', 'React', 'WebSocket'],
    grade: 'A',
  },
  {
    title: 'ShieldHer',
    abstract: 'A personal women safety wearable panic button connected via Bluetooth to a smartphone that detects distress audio keywords or sudden acceleration drops to broadcast live audio and GPS coordinates.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Rabia Basri',
    studentNames: ['Hina Riaz', 'Zainab Fatima'],
    technologies: ['Arduino Nano BLE', 'Flutter', 'Firebase', 'Twilio API', 'C++'],
    grade: 'A+',
  },
  {
    title: 'SceneNarrator: Localized Benchmarking of Vision-Language Models for Visually Impaired Assistance in Pakistan',
    abstract: 'A wearable assistive vision device with a wide-angle camera describing Pakistani street scenes, currency notes, rickshaws, and road obstacles in fluent spoken Urdu to visually impaired users.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Fahad Siddiqui',
    studentNames: ['Kashif Ali', 'Ahmed Raza'],
    technologies: ['Jetson Nano', 'LLaVA', 'Python', 'OpenCV', 'pyttsx3'],
    grade: 'A+',
  },
  {
    title: 'Robust Brain Tumor MRI Segmentation (BraTS)',
    abstract: 'An ensemble 3D nnU-Net deep learning framework segmenting necrotic, edema, and enhancing tumor core components from multi-modal MRI scans for neuro-oncology treatment evaluation.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Asif Nawaz',
    studentNames: ['Sarmad Ali', 'Nida Fatima'],
    technologies: ['PyTorch', 'nnU-Net', 'SimpleITK', 'Nibabel', 'Python'],
    grade: 'A+',
  },
  {
    title: 'AI-Based Intrusion Detection System (IDS)',
    abstract: 'A deep learning network intrusion prevention system trained on CICIDS2018 inspecting packet payload flows at gigabit line rates to detect distributed denial of service (DDoS) and lateral movement.',
    domain: 'Computer Science',
    year: 2023,
    supervisorName: 'Dr. Tariq Mahmood',
    studentNames: ['Asad Ullah', 'Noman Bashir'],
    technologies: ['Python', 'Scikit-Learn', 'PyTorch', 'Scapy', 'ElasticSearch'],
    grade: 'A',
  },
  {
    title: 'UniRide',
    abstract: 'A verified university carpooling and bike-sharing mobile application enabling campus students and faculty to split fuel costs, coordinate daily commuting routes, and minimize traffic congestion.',
    domain: 'Software Engineering',
    year: 2024,
    supervisorName: 'Dr. Nadia Rehman',
    studentNames: ['Alizeh Shah', 'Iqra Aziz'],
    technologies: ['React Native', 'Node.js', 'Express', 'MongoDB', 'Socket.io'],
    grade: 'A',
  },
  {
    title: 'CareWell AI',
    abstract: 'A smart clinical workflow suite providing symptom triaging, patient electronic health record (EHR) timeline management, and automated drug-drug interaction contraindication alerts.',
    domain: 'Software Engineering',
    year: 2023,
    supervisorName: 'Dr. Amna Farooq',
    studentNames: ['Farhan Siddiqui', 'Saad Ahmed'],
    technologies: ['React', 'Node.js', 'MongoDB', 'FastAPI', 'Python'],
    grade: 'A',
  },
  {
    title: 'AI Powered Dental Caries detection Systen',
    abstract: 'An intraoral dental X-ray analysis web application deploying fine-tuned YOLOv8 to localize early enamel demineralization, proximal caries, and periapical lesions for dental practitioners.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Sana Mir',
    studentNames: ['Hina Riaz', 'Maryam Nawaz'],
    technologies: ['PyTorch', 'YOLOv8', 'OpenCV', 'FastAPI', 'React'],
    grade: 'A',
  },
  {
    title: 'Genetics Disease Predictor',
    abstract: 'A bio-computational genomics portal analyzing single nucleotide polymorphisms (SNPs) and exome variant calling files to estimate hereditary cardiovascular and diabetes risk probabilities.',
    domain: 'Computer Science',
    year: 2023,
    supervisorName: 'Dr. Imran Ali',
    studentNames: ['Daniyal Qureshi', 'Kinza Hashmi'],
    technologies: ['Python', 'Biopython', 'Pandas', 'Scikit-Learn', 'React'],
    grade: 'A',
  },
  {
    title: 'Siba Digital Academic Support Platform(SDASP)',
    abstract: 'An integrated university learning management and student advisory portal featuring lecture schedule sync, GPA forecasting, tutor booking, and course feedback analytics.',
    domain: 'Software Engineering',
    year: 2024,
    supervisorName: 'Engr. Madiha Javed',
    studentNames: ['Zeeshan Haider', 'Bilal Nazeer'],
    technologies: ['React', 'Express', 'MongoDB', 'Node.js', 'Chart.js'],
    grade: 'A',
  },
  {
    title: 'LexiBot — The Judgment AI Powered System',
    abstract: 'An AI legal research assistant fine-tuned on Pakistani judicial case laws and constitutional statutes, capable of citing relevant Supreme Court precedents for legal briefs.',
    domain: 'Computer Science',
    year: 2024,
    supervisorName: 'Dr. Kashif Mehmood',
    studentNames: ['Haris Rauf', 'Saba Karim'],
    technologies: ['Python', 'LangChain', 'FAISS', 'FastAPI', 'React'],
    grade: 'A+',
  },
  {
    title: 'AI-Blockchain Powered Global Skill Verification & Learning Platform',
    abstract: 'A decentralized professional certification platform issuing Soulbound NFT tokens on Ethereum upon completion of AI-proctored coding examinations to eliminate credential fraud.',
    domain: 'Computer Science',
    year: 2024,
    supervisorName: 'Dr. Tariq Mahmood',
    studentNames: ['Ali Raza', 'Sara Noor'],
    technologies: ['Solidity', 'Ethereum', 'Web3.js', 'React', 'Node.js'],
    grade: 'A',
  },
  {
    title: 'Raven Bikes - Rider Accident Vigilance & Emergency Network for Bikes',
    abstract: 'A smart motorcycle helmet unit equipped with gyro/accelerometer impact sensors and GSM/GPS module that automatically dials ambulance services upon detecting high-G crash impacts.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Khursheed Ahmed',
    studentNames: ['Mustafa Kamal', 'Bilal Khan'],
    technologies: ['ESP32', 'MPU6050', 'GSM SIM800L', 'C++', 'Flutter'],
    grade: 'A+',
  },
  {
    title: 'CropAI (AI-based agricultural decisions)',
    abstract: 'An agricultural decision support platform combining weather forecasts, soil NPK telemetry, and multispectral drone imagery to advise farmers on optimal irrigation and pesticide scheduling.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Khursheed Ahmed',
    studentNames: ['Ali Raza', 'Omer Farooq'],
    technologies: ['Python', 'TensorFlow', 'ESP32', 'React', 'FastAPI'],
    grade: 'A+',
  },
  {
    title: 'Deep Learning-Based Detection of Intracranial Aneurysms Using Medical Imaging',
    abstract: 'A 3D convolutional neural network screening time-of-flight magnetic resonance angiography (TOF-MRA) scans to highlight small aneurysm out-pouchings and prevent hemorrhagic stroke.',
    domain: 'Computer System Engineering',
    year: 2024,
    supervisorName: 'Dr. Asif Nawaz',
    studentNames: ['Sarmad Ali', 'Nida Fatima'],
    technologies: ['PyTorch', '3D CNN', 'SimpleITK', 'Python', 'FastAPI'],
    grade: 'A+',
  },
  {
    title: 'STS- Test Analysis and Reporting System (TARS)',
    abstract: 'An enterprise recruitment testing analytics portal built for Sindh Testing Service to process candidate scores across multiple test centers, compute percentile cutoffs, and generate merit lists.',
    domain: 'Software Engineering',
    year: 2024,
    supervisorName: 'Dr. Amna Farooq',
    studentNames: ['Hamza Malik', 'Farhan Siddiqui'],
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'ExcelJS'],
    grade: 'A+',
  },
  {
    title: 'Virtual chemistry lab',
    abstract: 'An interactive 3D virtual web laboratory simulating chemical reactions, titration experiments, and safety protocols with realistic particle animations for high school and university students.',
    domain: 'Software Engineering',
    year: 2024,
    supervisorName: 'Dr. Nadia Rehman',
    studentNames: ['Alizeh Shah', 'Fahad Mustafa'],
    technologies: ['Three.js', 'React', 'WebGL', 'Node.js', 'TailwindCSS'],
    grade: 'A',
  },
  {
    title: 'AdmissionTimes— A One-Stop Platform for Admission Updates and Preparation',
    abstract: 'A centralized education portal offering university admission deadlines, past paper practice tests, entry test syllabus breakdowns, and automated WhatsApp alert subscriptions.',
    domain: 'Software Engineering',
    year: 2024,
    supervisorName: 'Engr. Madiha Javed',
    studentNames: ['Shahzad Noor', 'Nimra Khan'],
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'TailwindCSS'],
    grade: 'A',
  },
];

async function seedUserProjects() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fyp_management';
  console.log(`[Seed User Projects] Connecting to MongoDB: ${uri}`);
  await mongoose.connect(uri);

  let insertedCount = 0;
  let updatedCount = 0;

  for (const proj of userProjectsCorpus) {
    const existing = await PreviousFYP.findOne({ title: proj.title });
    if (!existing) {
      await PreviousFYP.create(proj);
      insertedCount++;
    } else {
      await PreviousFYP.updateOne({ title: proj.title }, { $set: proj });
      updatedCount++;
    }
  }

  const totalPrevious = await PreviousFYP.countDocuments();
  console.log(`[Seed User Projects] Added ${insertedCount} new projects, updated ${updatedCount} projects.`);
  console.log(`[Seed User Projects] Total Previous FYP Archive Count: ${totalPrevious}`);

  // Now also enrich active proposals/projects with some of the flagship titles
  const drKhursheed = await User.findOne({ email: 'dr.khursheed@university.edu' });
  const aliAhmed = await User.findOne({ email: 'student@university.edu' });

  if (drKhursheed && aliAhmed) {
    // Update Ali Ahmed's pending proposal to one of the flagship titles
    await Proposal.updateOne(
      { submittedBy: aliAhmed._id },
      {
        $set: {
          title: 'SIBAU-FYP Portal',
          abstract: 'A centralized university web portal for coordinating final year projects, managing the complete proposal submission lifecycle, milestone evaluation deliverables, supervisor allocation, and automated AI similarity detection.',
          domain: 'Computer System Engineering',
          technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'TailwindCSS'],
          similarityScore: 84.5,
          similarityWarning: true,
        },
      }
    );
    console.log('[Seed User Projects] Updated student proposal to: "SIBAU-FYP Portal"');
  }

  await mongoose.disconnect();
  console.log('[Seed User Projects] Successfully completed!');
  process.exit(0);
}

seedUserProjects().catch((err) => {
  console.error('[Seed User Projects Error]:', err);
  process.exit(1);
});
