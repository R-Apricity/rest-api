const obj = {};
  Array.from(
    document
      .querySelector("body > gradio-app")
      .shadowRoot.querySelectorAll("#component-16 > label > select > option")
  ).forEach((x) => {
    const a = x.value
      .split(" ")
      .map((x) => {
        if (x.match(/^[a-zA-Z]+$/) && !x.includes("Pretty")) return x;
      })
      .filter(Boolean);
    const result = `${a[0]} ${a[1] || ""} ${a[2] || ""} ${a[3] || ""} ${
      a[4] || ""
    }`;
    obj[a.join("").trim().toLowerCase()] = x.value;
  });
  console.log(JSON.stringify(obj, null, 2));