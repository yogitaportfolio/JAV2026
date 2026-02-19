const express = require("express");
const Test = require("../models/Test");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/getall", auth, async (req, res) => {
  try {
    const procedures = await Test.find({ is_active: true })
      .sort({ procedure_name: 1 })
      .lean();

    return res.send({
      status: 1,
      message: "Query executed successfully.",
      data: (procedures || []).map((procedure) => ({
        ...procedure,
        name: procedure.procedure_name || procedure.test_name || procedure.name,
      })),
    });
  } catch (error) {
    return res.send({ status: 0, message: "Query execution error.", data: "" });
  }
});

module.exports = router;
