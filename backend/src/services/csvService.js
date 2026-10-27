const { Readable } = require('stream');
const csv = require('csv-parser');

/**
 * Parses a CSV buffer into validated PreviousFYP records
 * @param {Buffer} buffer - Raw file buffer from Multer
 * @returns {Promise<{ validRecords: Array, invalidRows: Array, totalProcessed: number }>}
 */
const parsePreviousFypCsv = (buffer) => {
  return new Promise((resolve, reject) => {
    const validRecords = [];
    const invalidRows = [];
    let rowNumber = 1; // 1-indexed (header is line 1)

    const stream = Readable.from(buffer.toString('utf-8'));

    stream
      .pipe(
        csv({
          mapHeaders: ({ header }) => header.trim().toLowerCase(),
        })
      )
      .on('data', (row) => {
        rowNumber++;

        // Helper to get case-insensitive / variation keys
        const getField = (...keys) => {
          for (const key of keys) {
            if (row[key] !== undefined && row[key] !== null) {
              const val = row[key].toString().trim();
              if (val.length > 0) return val;
            }
          }
          return null;
        };

        const title = getField('title', 'project title', 'project_title', 'name');
        const abstract = getField('abstract', 'description', 'summary', 'project abstract');
        const domain = getField('domain', 'category', 'field') || 'Computer Science';
        const rawYear = getField('year', 'completion year', 'session', 'batch');
        const supervisorName = getField('supervisor', 'supervisor name', 'supervisorname', 'advisor');
        const rawStudents = getField('student names', 'students', 'studentnames', 'team members', 'members');
        const rawTech = getField('technologies', 'technology', 'tech stack', 'techstack', 'tools');
        const grade = getField('grade', 'final grade') || 'A';
        const documentUrl = getField('document url', 'documenturl', 'url', 'link') || '';

        // Validation
        const year = rawYear ? parseInt(rawYear, 10) : new Date().getFullYear();

        if (!title || !abstract || !supervisorName) {
          invalidRows.push({
            rowNumber,
            data: row,
            reason: 'Missing required field(s): title, abstract, or supervisorName',
          });
          return;
        }

        if (isNaN(year) || year < 2000 || year > 2100) {
          invalidRows.push({
            rowNumber,
            data: row,
            reason: `Invalid year '${rawYear}'. Must be between 2000 and 2100`,
          });
          return;
        }

        // Format student names array
        let studentNames = [];
        if (rawStudents) {
          studentNames = rawStudents
            .split(/[,;|]/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
        }
        if (studentNames.length === 0) {
          studentNames = ['FYP Student Team'];
        }

        // Format technologies array
        let technologies = [];
        if (rawTech) {
          technologies = rawTech
            .split(/[,;|]/)
            .map((t) => t.trim())
            .filter((t) => t.length > 0);
        }

        validRecords.push({
          title,
          abstract,
          domain,
          year,
          supervisorName,
          studentNames,
          technologies,
          grade,
          documentUrl,
        });
      })
      .on('end', () => {
        resolve({
          validRecords,
          invalidRows,
          totalProcessed: rowNumber - 1,
        });
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

module.exports = {
  parsePreviousFypCsv,
};
