const allowedMethods = ["POST", "OPTIONS"];

function sendJson(res, status, body) {
  res.status(status).json(body);
}

module.exports = async function projectRequests(req, res) {
  if (!allowedMethods.includes(req.method)) {
    res.setHeader("Allow", allowedMethods.join(", "));
    return sendJson(res, 405, { error: "Método não permitido." });
  }

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const table = process.env.SUPABASE_PROJECT_REQUESTS_TABLE || "project_requests";

  if (!supabaseUrl || !supabaseKey) {
    return sendJson(res, 500, {
      error: "A integração com o Supabase ainda não foi configurada no servidor.",
    });
  }

  const body = req.body || {};
  const projectType = String(body.projectType || "").trim();
  const description = String(body.description || "").trim();
  const name = String(body.name || "").trim();
  const contact = String(body.contact || "").trim();

  if (!projectType || !description || !name || !contact) {
    return sendJson(res, 400, {
      error: "Preencha tipo de projeto, descrição, nome e contato.",
    });
  }

  if (
    projectType.length > 120 ||
    description.length > 10000 ||
    name.length > 160 ||
    contact.length > 240
  ) {
    return sendJson(res, 400, { error: "Um ou mais campos excedem o tamanho permitido." });
  }

  const payload = {
    project_type: projectType,
    description,
    project_references: String(body.references || "").trim() || null,
    deadline: String(body.deadline || "").trim() || null,
    budget: String(body.budget || "").trim() || null,
    name,
    contact,
  };

  try {
    const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("Supabase project request failed", response.status, details);
      return sendJson(res, 502, { error: "Não foi possível salvar a solicitação agora." });
    }

    return sendJson(res, 201, { ok: true });
  } catch (error) {
    console.error("Supabase project request error", error);
    return sendJson(res, 502, { error: "Não foi possível conectar ao banco agora." });
  }
};
