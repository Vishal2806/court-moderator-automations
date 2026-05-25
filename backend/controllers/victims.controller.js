import pool from "../config/db.js";
import XLSX from "xlsx";

// ==========================
// Normalize Excel Headers
// ==========================
const normalizeRow = (row, keys) => {
  const normalizedRow = {};

  Object.keys(row).forEach((key) => {
    const cleanKey = String(key)
      .replace(/\n/g, " ")
      .replace(/\r/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    normalizedRow[cleanKey] = row[key];
  });

  for (const key of keys) {
    const cleanKey = String(key)
      .replace(/\n/g, " ")
      .replace(/\r/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    const value = normalizedRow[cleanKey];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return undefined;
};

// ==========================
// Upload Single Victim
// ==========================
export const uploadVictim = async (req, res) => {
  try {
    const {
      hearing_date,
      case_no,
      court_hall_no,
      party_name,
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
      !party_name ||
      !counsel_name_through_vc ||
      !technical_person
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required victim fields",
      });
    }

    const maxResult = await pool.query(
      "SELECT MAX(serial_no) as max_serial FROM victims"
    );

    const serial_no =
      (maxResult.rows[0].max_serial || 0) + 1;

    const hearing_date_value =
      hearing_date ||
      new Date().toISOString().slice(0, 10);

    const result = await pool.query(
      `
      INSERT INTO victims (
        serial_no,
        hearing_date,
        case_no,
        court_hall_no,
        party_name,
        counsel_name_through_vc,
        technical_person,
        uploaded_file,
        remarks
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
      [
        serial_no,
        hearing_date_value,
        case_no,
        court_hall_no,
        party_name,
        counsel_name_through_vc,
        technical_person,
        uploaded_file,
        remarks || null,
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
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
// Get Victims
// ==========================
export const getVictims = async (req, res) => {
  try {
    const page =
      parseInt(req.query.page, 10) || 1;

    const limit =
      parseInt(req.query.limit, 10) || 10;

    const offset = (page - 1) * limit;

    const {
      date,
      case_no,
      court_hall_no,
    } = req.query;

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
      FROM victims
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
      FROM victims
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
      victims: result.rows,
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
// Bulk Upload Victims
// ==========================
export const bulkUploadVictims = async (req, res) => {

  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "No file uploaded",
    });
  }

  try {

    // ==========================
    // Read Excel
    // ==========================
    const workbook = XLSX.read(req.file.buffer, {
      type: "buffer",
    });

    const sheetName = workbook.SheetNames[0];

    const worksheet = workbook.Sheets[sheetName];

    // ==========================
    // Read Sheet As Array
    // ==========================
    const rows = XLSX.utils.sheet_to_json(
      worksheet,
      {
        header: 1,
        defval: "",
      }
    );

    // ==========================
    // Remove Empty Rows
    // ==========================
    const filteredRows = rows.filter((row) =>
      row.some(
        (cell) =>
          String(cell).trim() !== ""
      )
    );

    if (filteredRows.length < 2) {
      return res.status(400).json({
        success: false,
        error: "Excel file is empty",
      });
    }

    // ==========================
    // Find Header Row
    // ==========================
    let headerRowIndex = 0;

    for (let i = 0; i < filteredRows.length; i++) {

      const rowString = filteredRows[i]
        .join(" ")
        .toLowerCase();

      if (
        rowString.includes("case") &&
        rowString.includes("court")
      ) {
        headerRowIndex = i;
        break;
      }
    }

    const headers =
      filteredRows[headerRowIndex];

    const dataRows =
      filteredRows.slice(headerRowIndex + 1);

    // ==========================
    // Find Column Indexes
    // ==========================
    const getIndex = (possibleNames) => {

      return headers.findIndex((header) => {

        const cleanHeader = String(header)
          .replace(/\n/g, " ")
          .replace(/\r/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();

        return possibleNames.some((name) =>
          cleanHeader.includes(
            name.toLowerCase()
          )
        );
      });
    };

    const indexes = {

      serial_no: getIndex([
        "s.n",
        "serial",
      ]),

      hearing_date: getIndex([
        "date",
      ]),

      case_no: getIndex([
        "case no",
        "case number",
      ]),

      court_hall_no: getIndex([
        "court hall",
        "hall no",
      ]),

      party_name: getIndex([
        "party name",
        "petitonar name",
        "petitioner name",
      ]),

      counsel_name: getIndex([
        "counsel name through vc",
        "counsel name",
      ]),

      technical_person: getIndex([
        "technical person",
      ]),

      remarks: getIndex([
        "remarks",
      ]),
    };

    // ==========================
    // Get Max Serial
    // ==========================
    const maxResult = await pool.query(
      "SELECT MAX(serial_no) as max_serial FROM victims"
    );

    let serial_no =
      (maxResult.rows[0].max_serial || 0) + 1;

    const inserted = [];
    const skipped = [];

    // ==========================
    // Process Rows
    // ==========================
    for (const [index, row] of dataRows.entries()) {

      try {

        // ==========================
        // Date Formatting
        // ==========================
        let hearing_date_value =
          row[indexes.hearing_date];

        if (
          typeof hearing_date_value ===
          "number"
        ) {

          const excelDate =
            XLSX.SSF.parse_date_code(
              hearing_date_value
            );

          if (excelDate) {

            hearing_date_value =
              `${excelDate.y}-${String(
                excelDate.m
              ).padStart(2, "0")}-${String(
                excelDate.d
              ).padStart(2, "0")}`;
          }
        }

        // DD/MM/YYYY support
        if (
          typeof hearing_date_value ===
          "string"
        ) {

          const parts =
            hearing_date_value.split("/");

          if (parts.length === 3) {

            hearing_date_value =
              `${parts[2]}-${parts[1].padStart(
                2,
                "0"
              )}-${parts[0].padStart(
                2,
                "0"
              )}`;
          }
        }

        // Fallback
        if (
          !hearing_date_value ||
          String(
            hearing_date_value
          ).trim() === ""
        ) {

          hearing_date_value =
            new Date()
              .toISOString()
              .slice(0, 10);
        }

        // ==========================
        // Read Values
        // ==========================
        const case_no_value =
          row[indexes.case_no];

        const court_hall_no_value =
          row[indexes.court_hall_no];

        const party_name_value =
          row[indexes.party_name];

        const counsel_name_value =
          row[indexes.counsel_name];

        const technical_person_value =
          row[indexes.technical_person];

        const remarks_value =
          row[indexes.remarks];

        // ==========================
        // Skip Invalid Rows
        // ==========================
        if (
          !case_no_value ||
          !court_hall_no_value ||
          !party_name_value
        ) {

          skipped.push({
            row: index + 1,
            reason: "Missing required fields",
          });

          continue;
        }

        // ==========================
        // Insert Query
        // ==========================
        await pool.query(
          `
          INSERT INTO victims (
            serial_no,
            hearing_date,
            case_no,
            court_hall_no,
            party_name,
            counsel_name_through_vc,
            technical_person,
            remarks
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
          `,
          [
            serial_no++,
            hearing_date_value,
            String(case_no_value).trim(),
            String(court_hall_no_value).trim(),
            String(party_name_value).trim(),
            counsel_name_value
              ? String(
                  counsel_name_value
                ).trim()
              : null,
            technical_person_value
              ? String(
                  technical_person_value
                ).trim()
              : null,
            remarks_value
              ? String(
                  remarks_value
                ).trim()
              : null,
          ]
        );

        inserted.push(index + 1);

      } catch (err) {

        console.error(err);

        skipped.push({
          row: index + 1,
          reason: err.message,
        });
      }
    }

    // ==========================
    // Response
    // ==========================
    res.status(201).json({
      success: true,
      inserted: inserted.length,
      skipped: skipped.length,
      skippedDetails: skipped,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
