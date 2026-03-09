import React from "react";

const h = React.createElement;

function sanitize(text = "") {
  return text.replace(/→/g, " to ").replace(/←/g, " from ");
}

function clampText(text = "", maxLength = 120) {
  const clean = sanitize(text);
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trimEnd()}…`;
}

function normalize(p) {
  return p.startsWith("/") ? p : `/${p}`;
}

function getPageLabel(pathname) {
  const p = normalize(pathname);
  if (p === "/") return "Portfolio";
  if (p.startsWith("/blog")) return "Blog";
  return "Website";
}

export async function renderOpenGraphImage({ title, description, pathname }) {
  const accent = "#34d399";
  const p = normalize(pathname);
  const label = getPageLabel(p);
  const url = p === "/" ? "nitish.sh" : `nitish.sh${p}`;

  return Promise.resolve(
    h(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#09090b",
          padding: "32px",
          fontFamily: "Inter",
          color: "#f8fafc",
        },
      },
      h(
        "div",
        {
          style: {
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#111217",
            border: "1px solid #1e293b",
            borderRadius: "24px",
            padding: "48px 56px",
          },
        },
        h(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            },
          },
          h(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
              },
            },
            h(
              "div",
              {
                style: {
                  width: "48px",
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "14px",
                  backgroundColor: accent,
                  color: "#09090b",
                  fontSize: "24px",
                  fontWeight: 700,
                  marginRight: "14px",
                },
              },
              "N",
            ),
            h(
              "div",
              {
                style: {
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#f8fafc",
                },
              },
              "nitish.sh",
            ),
          ),
          h(
            "div",
            {
              style: {
                border: `1px solid ${accent}`,
                borderRadius: "999px",
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: 600,
                color: accent,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              },
            },
            label,
          ),
        ),
        h(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              maxWidth: "90%",
            },
          },
          h(
            "div",
            {
              style: {
                fontSize: "52px",
                lineHeight: 1.15,
                fontWeight: 700,
                color: "#f8fafc",
              },
            },
            clampText(title, 100),
          ),
          description
            ? h(
                "div",
                {
                  style: {
                    fontSize: "22px",
                    lineHeight: 1.5,
                    color: "#94a3b8",
                    marginTop: "20px",
                  },
                },
                clampText(description, 140),
              )
            : null,
        ),
        h(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            },
          },
          h("div", {
            style: {
              width: "48px",
              height: "4px",
              borderRadius: "999px",
              backgroundColor: accent,
            },
          }),
          h(
            "div",
            {
              style: {
                fontSize: "16px",
                color: "#475569",
              },
            },
            url,
          ),
        ),
      ),
    ),
  );
}
