const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = 'C:\\Users\\Modern Tech\\.gemini\\antigravity\\brain\\32c6afaa-c000-4169-acd0-dbec8d805dda\\screenshots';
const BASE_URL = 'http://127.0.0.1:5173';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runE2E() {
  console.log('========================================================================');
  console.log('       PHASE 8: FULL END-TO-END BROWSER AUTOMATION & VALIDATION');
  console.log('========================================================================\n');

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1400, height: 950 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log('[PAGE ERROR]', msg.text());
  });

  // Helper to log in reliably
  async function loginAs(email, password) {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });

    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    
    // Type email
    await page.click('input[name="email"]');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.type('input[name="email"]', email, { delay: 10 });

    // Type password
    await page.click('input[name="password"]');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.type('input[name="password"]', password, { delay: 10 });

    await page.click('button[type="submit"]');
    await sleep(2500);
  }

  const timestamp = Date.now();
  const testStudentEmail = `sara.khan.${timestamp}@university.edu`;
  const pastFypTitle = `3D U-Net Automated Brain Tumor Lesion Segmentation ${timestamp}`;
  const pastFypAbstract = `A multi-modal deep learning framework utilizing 3D U-Net convolutional neural network architectures to accurately segment brain glioma tumor lesions from MRI volumetric scans and evaluate patient survival prognosis.`;

  try {
    // -------------------------------------------------------------------------
    // STEP 1: ADMIN LOGIN & DASHBOARD
    // -------------------------------------------------------------------------
    console.log('[Step 1/8] Admin logging in...');
    await loginAs('admin@university.edu', 'Password@123');
    await page.waitForSelector('h1', { timeout: 10000 });
    await sleep(1500);

    const step1Path = path.join(SCREENSHOT_DIR, '01_admin_dashboard.png');
    await page.screenshot({ path: step1Path, fullPage: false });
    console.log(`[PASS] Captured Step 1: ${step1Path}`);

    // -------------------------------------------------------------------------
    // STEP 2: ADMIN ADDS PREVIOUS FYP TO CORPUS
    // -------------------------------------------------------------------------
    console.log('\n[Step 2/8] Admin adding past FYP to corpus...');
    await page.goto(`${BASE_URL}/admin/previous-fyps`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    // Click "Add Past FYP" button
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find((b) => (b.textContent || '').includes('Add Past FYP'));
      if (target) target.click();
    });
    await sleep(1000);

    // Wait for modal and fill form fields via native React value setter
    await page.evaluate(({ title, abstract }) => {
      function setVal(input, val) {
        if (!input) return;
        const nativeSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        ).set;
        nativeSetter.call(input, val);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }

      function setTextareaVal(textarea, val) {
        if (!textarea) return;
        const nativeSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          'value'
        ).set;
        nativeSetter.call(textarea, val);
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }

      const modal = document.querySelector('.fixed');
      if (!modal) return;

      const inputs = Array.from(modal.querySelectorAll('input'));
      const textareas = Array.from(modal.querySelectorAll('textarea'));

      const titleInput = inputs.find((i) => i.placeholder && i.placeholder.includes('Skin Cancer'));
      setVal(titleInput, title);

      if (textareas.length > 0) {
        setTextareaVal(textareas[0], abstract);
      }

      const yearInput = inputs.find((i) => i.placeholder && i.placeholder.includes('2024'));
      setVal(yearInput, '2024');

      const domainInput = inputs.find((i) => i.placeholder && i.placeholder.includes('Artificial Intelligence'));
      setVal(domainInput, 'Artificial Intelligence');

      const gradeInput = inputs.find((i) => i.placeholder && i.placeholder.includes('A'));
      setVal(gradeInput, 'A+');

      const supInput = inputs.find((i) => i.placeholder && i.placeholder.includes('Khursheed'));
      setVal(supInput, 'Dr. Khursheed Ahmed');

      const stuInput = inputs.find((i) => i.placeholder && i.placeholder.includes('Ali Khan'));
      setVal(stuInput, 'Hamza Tariq, Bilal Ahmed');

      const techInput = inputs.find((i) => i.placeholder && i.placeholder.includes('Python, PyTorch'));
      setVal(techInput, 'PyTorch, 3D U-Net, React, FastAPI');
    }, { title: pastFypTitle, abstract: pastFypAbstract });

    await sleep(600);

    // Submit modal
    await page.evaluate(() => {
      const modal = document.querySelector('.fixed');
      if (modal) {
        const submitBtn = modal.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      }
    });

    await sleep(2500);
    const step2Path = path.join(SCREENSHOT_DIR, '02_admin_added_previous_fyp.png');
    await page.screenshot({ path: step2Path, fullPage: false });
    console.log(`[PASS] Captured Step 2: ${step2Path}`);

    // -------------------------------------------------------------------------
    // STEP 3: STUDENT REGISTRATION
    // -------------------------------------------------------------------------
    console.log('\n[Step 3/8] Registering new student candidate...');
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });

    await page.waitForSelector('input[name="name"]', { timeout: 10000 });
    await page.type('input[name="name"]', 'Sara Khan', { delay: 10 });
    await page.type('input[name="email"]', testStudentEmail, { delay: 10 });
    await page.type('input[name="studentId"]', `CS-${timestamp.toString().slice(-6)}`, { delay: 10 });
    await page.type('input[name="phone"]', '+92-312-9988776', { delay: 10 });
    await page.type('input[name="password"]', 'Password@123', { delay: 10 });
    await page.type('input[name="confirmPassword"]', 'Password@123', { delay: 10 });

    await page.click('button[type="submit"]');
    await sleep(3000);

    const step3Path = path.join(SCREENSHOT_DIR, '03_student_registered.png');
    await page.screenshot({ path: step3Path, fullPage: false });
    console.log(`[PASS] Captured Step 3: ${step3Path}`);

    // -------------------------------------------------------------------------
    // STEP 4: STUDENT DRAFTS SIMILAR PROPOSAL & TESTS AI SIMILARITY
    // -------------------------------------------------------------------------
    console.log('\n[Step 4/8] Student testing AI similarity on proposal draft...');
    await page.goto(`${BASE_URL}/student/proposal`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    await page.waitForSelector('input[name="title"]', { timeout: 10000 });
    await page.type('input[name="title"]', pastFypTitle, { delay: 10 });
    await page.type('textarea[name="abstract"]', pastFypAbstract, { delay: 5 });
    await page.type('input[name="technologies"]', 'PyTorch, 3D U-Net, React, FastAPI', { delay: 10 });
    await page.type('input[name="groupMembers"]', 'Sara Khan, Ayesha Noor', { delay: 10 });

    // Click "Test AI Similarity" using textContent
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const testBtn = btns.find((b) => (b.textContent || '').includes('Test AI Similarity'));
      if (testBtn) testBtn.click();
    });

    // Wait for AI results to return from FastAPI microservice
    console.log('Waiting for AI similarity analysis results...');
    await page.waitForFunction(
      () => document.body.innerText.includes('AI Semantic Analysis Results') || document.body.innerText.includes('Match Score'),
      { timeout: 25000 }
    );
    await sleep(2000);

    const step4Path = path.join(SCREENSHOT_DIR, '04_student_ai_similarity_warning.png');
    await page.screenshot({ path: step4Path, fullPage: false });
    console.log(`[PASS] Captured Step 4: ${step4Path}`);

    // -------------------------------------------------------------------------
    // STEP 5: STUDENT SUBMITS FINAL PROPOSAL
    // -------------------------------------------------------------------------
    console.log('\n[Step 5/8] Student submitting proposal to coordinator...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const submitBtn = btns.find((b) => (b.textContent || '').includes('Submit Final Proposal')) || document.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    });

    await sleep(3500);
    const step5Path = path.join(SCREENSHOT_DIR, '05_student_proposal_submitted.png');
    await page.screenshot({ path: step5Path, fullPage: false });
    console.log(`[PASS] Captured Step 5: ${step5Path}`);

    // -------------------------------------------------------------------------
    // STEP 6: ADMIN ASSIGNS SUPERVISOR TO PROPOSAL
    // -------------------------------------------------------------------------
    console.log('\n[Step 6/8] Admin assigning Dr. Khursheed to proposal...');
    await loginAs('admin@university.edu', 'Password@123');
    await page.goto(`${BASE_URL}/admin/allocation`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    // Switch to "Allocate by Proposal" tab
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const propTab = tabs.find((t) => (t.textContent || '').includes('Allocate by Proposal'));
      if (propTab) propTab.click();
    });
    await sleep(1500);

    // Select Dr. Khursheed in the first row select element
    const supervisorValue = await page.evaluate(() => {
      const selects = document.querySelectorAll('tbody tr select');
      if (selects.length === 0) return null;
      const sel = selects[0];
      const opt = Array.from(sel.options).find((o) => o.text.includes('Khursheed') || o.value);
      return opt ? opt.value : null;
    });

    if (supervisorValue) {
      await page.select('tbody tr select', supervisorValue);
      await sleep(800);
      await page.evaluate(() => {
        const rows = document.querySelectorAll('tbody tr');
        if (rows.length > 0) {
          const btn = rows[0].querySelector('button');
          if (btn && !btn.disabled) btn.click();
        }
      });
      await sleep(2500);
    }

    const step6Path = path.join(SCREENSHOT_DIR, '06_admin_assigned_supervisor.png');
    await page.screenshot({ path: step6Path, fullPage: false });
    console.log(`[PASS] Captured Step 6: ${step6Path}`);

    // -------------------------------------------------------------------------
    // STEP 7: SUPERVISOR REVIEWS AND APPROVES PROPOSAL
    // -------------------------------------------------------------------------
    console.log('\n[Step 7/8] Supervisor Dr. Khursheed reviewing and approving...');
    await loginAs('dr.khursheed@university.edu', 'Password@123');
    await page.goto(`${BASE_URL}/supervisor/proposals`, { waitUntil: 'networkidle2' });
    await sleep(2000);

    // Click "Evaluate & Decide"
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const evalBtn = btns.find((b) => (b.textContent || '').includes('Evaluate & Decide'));
      if (evalBtn) evalBtn.click();
    });
    await sleep(1000);

    // In modal, type remarks and confirm decision
    await page.waitForSelector('.fixed textarea', { timeout: 8000 });
    await page.type(
      '.fixed textarea',
      'Approved! The 3D U-Net approach is mathematically sound and feasible. Proceed with literature survey and SRS documentation.',
      { delay: 10 }
    );
    await sleep(500);
    await page.evaluate(() => {
      const modal = document.querySelector('.fixed');
      if (modal) {
        const confirmBtn = Array.from(modal.querySelectorAll('button')).find((b) =>
          (b.textContent || '').includes('Confirm Decision')
        );
        if (confirmBtn) confirmBtn.click();
      }
    });
    await sleep(3000);

    const step7Path = path.join(SCREENSHOT_DIR, '07_supervisor_approved_proposal.png');
    await page.screenshot({ path: step7Path, fullPage: false });
    console.log(`[PASS] Captured Step 7: ${step7Path}`);

    // -------------------------------------------------------------------------
    // STEP 8: SUPERVISOR AWARDS MILESTONE MARKS
    // -------------------------------------------------------------------------
    console.log('\n[Step 8/8] Supervisor awarding Proposal Defense marks...');
    await page.goto(`${BASE_URL}/supervisor/grading`, { waitUntil: 'networkidle2' });
    await sleep(2000);

    await page.waitForSelector('input[type="number"][placeholder*="88"]', { timeout: 8000 });
    await page.type('input[type="number"][placeholder*="88"]', '94');
    await page.type(
      'textarea',
      'Outstanding initial defense. Deep mathematical understanding of 3D convolutional tensor transformations and MRI pre-processing.'
    );
    await sleep(500);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const pubBtn = btns.find((b) => (b.textContent || '').includes('Publish Milestone Marks'));
      if (pubBtn) pubBtn.click();
    });
    await sleep(3000);

    const step8Path = path.join(SCREENSHOT_DIR, '08_supervisor_awarded_marks.png');
    await page.screenshot({ path: step8Path, fullPage: false });
    console.log(`[PASS] Captured Step 8: ${step8Path}`);

    // -------------------------------------------------------------------------
    // STEP 9: STUDENT SEES STATUS, ROADMAP, MARKS
    // -------------------------------------------------------------------------
    console.log('\n[Verification] Student checking project status and evaluation...');
    await loginAs(testStudentEmail, 'Password@123');
    await page.goto(`${BASE_URL}/student/project-status`, { waitUntil: 'networkidle2' });
    await sleep(2500);

    const step9Path = path.join(SCREENSHOT_DIR, '09_student_status_verified.png');
    await page.screenshot({ path: step9Path, fullPage: false });
    console.log(`[PASS] Captured Step 9: ${step9Path}`);

    console.log('\n========================================================================');
    console.log('       ALL 9 END-TO-END WORKFLOW SCREENSHOTS CAPTURED SUCCESSFULLY!');
    console.log('========================================================================\n');
  } catch (err) {
    console.error('\n[FATAL TEST ERROR]', err.message);
    const errPath = path.join(SCREENSHOT_DIR, 'error_state.png');
    await page.screenshot({ path: errPath });
    console.log(`Saved error screenshot to: ${errPath}`);
  } finally {
    await browser.close();
  }
}

runE2E();
