import fs from "fs";
import path from "path";
import ejs from "ejs";
import express from "express";
import fileUpload from "express-fileupload";

let images = fs.readFileSync("data/datas.json", "utf-8") || "[]";
images = JSON.parse(images);

const port = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(express.static("image"));

app.engine("html", ejs.renderFile);
app.set("view engine", "html");
app.set(".html", path.join(process.cwd(), "views"));
app.use(express.urlencoded({ extended: false }));

app.use(
  fileUpload({
    limits: { fileSize: 15 * 1024 * 1024 },
  })
);

app.get("/", (req, res) => res.render("main", { images }));
app.get("/download/image/:name", (req, res) => {
  res.download(path.join(process.cwd(), "image", req.params.name));
});

app.post("/upload", (req, res) => {
  let file = req.files.image;
  if (file.truncated) return res.send("you must send max 1 mb file");
  let types = file.name.split(".");
  let type = types[types.length - 1];
  let obj = {
    name: req.body.name,
    imgpath: "/" + req.body.name + "." + type,
  };
  obj.id = images.length ? images[images.length - 1].id + 1 : 1;
  images.unshift(obj);
  fs.writeFileSync("data/datas.json", JSON.stringify(images, null, 4));

  file.mv(
    path.join(process.cwd(), "image", req.body.name + "." + type),
    function (err) {
      if (err) res.send(err.message);
      else res.redirect("/");
    }
  );
});

// app.post("/upload", (req, res) => {
//   try {
//     for (let key in req.files) {
//       let file = req.files[key];
//       let filePath = file.mimetype.split("/")[0];
//       //   if (file.truncated) return res.send("you must send max 1 mb file");

//       file.mv(
//         path.join(
//           process.cwd(),
//           filePath == "image" ? "rasm" : "video",
//           file.name
//         )
//       );
//     }
//     res.send("ok");
//   } catch (err) {
//     res.send(err);
//   }
// });
app.listen(port, console.log("Running ... http://localhost:" + port));
