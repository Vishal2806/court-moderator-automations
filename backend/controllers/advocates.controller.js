import pool from "../config/db.js";
import XLSX from "xlsx";

// Normalize Excel Row Keys
const normalizeRow = (row, keys) => {
  const normalizedRow = {};

  // normalize excel headers
  Object.keys(row).forEach((key) => {
    normalizedRow[key.toLowerCase().trim()] = row[key];
  });

  // match keys
  for (const key of keys) {
    const normalizedKey = key.toLowerCase().trim();

    if (
      normalizedRow[normalizedKey] !== undefined &&
      normalizedRow[normalizedKey] !== null &&
      normalizedRow[normalizedKey] !== ""
    ) {
      return normalizedRow[normalizedKey];
    }
  }

  return undefined;
};

// ==========================
// Upload Single Advocate
// ==========================
export const uploadAdvocate = async (req, res) => {
  const {
    hearing_date,
    case_no,
    court_hall_no,
    petitioner_name,
    counsel_name_through_vc,
    technical_person,
    remarks,
  } = req.body;

  const uploaded_file = req.file
    ? `uploads/${req.file.filename}`
    : null;

  if (
    !case_no ||
    !court_hall_no ||
    !petitioner_name ||
    !counsel_name_through_vc ||
    !technical_person
  ) {
    return res.status(400).json({
      success: false,
      error: "Missing required advocate fields",
    });
  }

  try {
    const maxResult = await pool.query(
      "SELECT MAX(serial_no) as max_serial FROM advocates"
    );

    const serial_no =
      (maxResult.rows[0].max_serial || 0) + 1;

    const hearing_date_value =
      hearing_date ||
      new Date().toISOString().slice(0, 10);

    const query = `
      INSERT INTO advocates (
        serial_no,
        hearing_date,
        case_no,
        court_hall_no,
        petitioner_name,
        counsel_name_through_vc,
        technical_person,
        uploaded_file,
        remarks
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `;

    const values = [
      serial_no,
      hearing_date_value,
      case_no,
      court_hall_no,
      petitioner_name,
      counsel_name_through_vc,
      technical_person,
      uploaded_file,
      remarks || null,
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: "Advocate record created successfully",
      advocate: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ==========================
// Get Advocates
// ==========================
export const getAdvocates = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const offset = (page - 1) * limit;

    const { date, case_no, court_hall_no } = req.query;

    let whereClause = "";
    const values = [];

    let paramIndex = 1;

    if (date) {
      whereClause += ` AND hearing_date = $${paramIndex++}`;
      values.push(date);
    }

    if (case_no) {
      whereClause += ` AND case_no ILIKE $${paramIndex++}`;
      values.push(`%${case_no}%`);
    }

    if (court_hall_no) {
      whereClause += ` AND court_hall_no ILIKE $${paramIndex++}`;
      values.push(`%${court_hall_no}%`);
    }

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM advocates
      WHERE 1=1 ${whereClause}
    `;

    const countResult = await pool.query(
      countQuery,
      values
    );

    const total = parseInt(
      countResult.rows[0].total,
      10
    );

    const resultQuery = `
      SELECT *
      FROM advocates
      WHERE 1=1 ${whereClause}
      ORDER BY serial_no DESC
      LIMIT $${paramIndex++}
      OFFSET $${paramIndex++}
    `;

    values.push(limit, offset);

    const result = await pool.query(
      resultQuery,
      values
    );

    res.json({
      success: true,
      advocates: result.rows,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ==========================
// Bulk Upload Advocates
// ==========================
export const bulkUploadAdvocates = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "No file uploaded",
    });
  }

  try {
    // Read Excel
    const workbook = XLSX.read(req.file.buffer, {
      type: "buffer",
    });

    const sheetName = workbook.SheetNames[0];

    const worksheet = workbook.Sheets[sheetName];

    // Convert Sheet To JSON
    const data = XLSX.utils.sheet_to_json(
      worksheet,
      {
        defval: "",
      }
    );

    // Get Current Max Serial
    const maxResult = await pool.query(
      "SELECT MAX(serial_no) as max_serial FROM advocates"
    );

    let serial_no =
      (maxResult.rows[0].max_serial || 0) + 1;

    const inserted = [];
    const skipped = [];

    const headers = Object.keys(data[0] || {});

    for (const [index, row] of data.entries()) {
      let hearing_date_value = normalizeRow(row, [
        "hearing_date",
        "Hearing Date",
        "Date",
        "date",
      ]);

      // Convert Excel serial number date to YYYY-MM-DD
      if (typeof hearing_date_value === "number") {
        const excelDate = XLSX.SSF.parse_date_code(
          hearing_date_value
        );

        if (excelDate) {
          hearing_date_value = `${excelDate.y}-${String(
            excelDate.m
          ).padStart(2, "0")}-${String(
            excelDate.d
          ).padStart(2, "0")}`;
        } else {
          hearing_date_value = null;
        }
      }
      if (
        !hearing_date_value ||
        String(hearing_date_value).trim() === ""
      ) {
        hearing_date_value = new Date()
          .toISOString()
          .slice(0, 10);
      }

      const case_no_value = normalizeRow(row, [
        "case_no",
        "Case No",
        "Case Number",
        "case number",
        "Case_No",
      ]);

      const court_hall_no_value = normalizeRow(row, [
        "court_hall_no",
        "Court Hall No",
        "Hall No",
        "hall_no",
        "hall",
        "Court_Hall_No",
      ]);

      const petitioner_name_value = normalizeRow(
        row,
        [
          "petitioner_name",
          "Petitioner Name",
          "Petitioner",
          "Petitonar Name",
        ]
      );

      const counsel_name_value = normalizeRow(
        row,
        [
          "counsel_name_through_vc",
          "Counsel Name Through VC",
          "Counsel Name",
        ]
      );

      const technical_person_value = normalizeRow(
        row,
        [
          "technical_person",
          "Technical Person",
        ]
      );

      const remarks_value = normalizeRow(row, [
        "remarks",
        "Remarks",
      ]);

      // Skip Missing Required Fields
      if (
        !case_no_value ||
        !court_hall_no_value ||
        !petitioner_name_value ||
        !counsel_name_value ||
        !technical_person_value
      ) {
        skipped.push({
          row: index + 1,
          missing: {
            case_no: !case_no_value,
            court_hall_no: !court_hall_no_value,
            petitioner_name:
              !petitioner_name_value,
            counsel_name:
              !counsel_name_value,
            technical_person:
              !technical_person_value,
          },
          rowData: row,
        });

        continue;
      }

      // Insert Query
      const query = `
        INSERT INTO advocates (
          serial_no,
          hearing_date,
          case_no,
          court_hall_no,
          petitioner_name,
          counsel_name_through_vc,
          technical_person,
          uploaded_file,
          remarks
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `;

      const values = [
        serial_no++,
        hearing_date_value ||
        new Date().toISOString().slice(0, 10),
        case_no_value,
        court_hall_no_value,
        petitioner_name_value,
        counsel_name_value,
        technical_person_value,

        // optional uploaded file
        req.file
          ? `uploads/${req.file.filename}`
          : null,

        remarks_value || null,
      ];

      await pool.query(query, values);

      inserted.push({
        serial_no: serial_no - 1,
        hearing_date: hearing_date_value,
      });
    }

    res.status(201).json({
      success: true,

      message: `Bulk uploaded ${inserted.length} advocate records${skipped.length > 0
        ? `, skipped ${skipped.length} rows`
        : ""
        }`,

      inserted: inserted.length,

      skipped: skipped.length,

      headers,

      ...(skipped.length > 0 && {
        skippedDetails: skipped.slice(0, 10),
      }),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
