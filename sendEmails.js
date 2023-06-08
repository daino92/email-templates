const argv = require("yargs").argv;
const emailSetup = require("./emailSetup");
const mailjet = require("node-mailjet").connect(
  /*
        Get your API keys from: 
        https://dev.mailjet.com/email/guides/
        Current free plan allows 200 emails per month
    */
  emailSetup.mailjet.public_api_key,
  emailSetup.mailjet.private_api_key
);

const isProduction = argv.env === "production";

const { findFiles, getFileContents, stripHTML } = require("./helpers");

function sendEmail({ from, fromName, to, toName, subject, text, html }) {
  return new Promise((resolve, reject) => {
    const request = mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: from,
            Name: fromName,
          },
          To: [
            {
              Email: to,
              Name: toName,
            },
          ],
          Subject: subject,
          TextPart: text,
          HTMLPart: html,
          CustomID: "Email-Test",
        },
      ],
    });
    request
      .then((result) => {
        resolve(`Successfully sent to ${toName} <${to}>`);
      })
      .catch((err) => {
        reject(new Error(`Failed to send to ${toName} <${to}>`));
      });
  });
}

function sendToEmail() {
  const fileToSend = argv.file;
  if (!fileToSend) return Promise.reject(new Error("Provide a file name"));
  return new Promise((resolve, reject) => {
    const files = findFiles("./dist", fileToSend);
    if (files.length === 0) {
      reject(new Error(`Can not find file: ${fileToSend}`));
    } else {
      if (files.length > 1) {
        console.log(`
                    Found ${files.length} files with the name ${fileToSend}.\n
                    Using the file: ${files[0]}
                `);
      }
      getFileContents(files[0])
        .then((fileContent) => {
          const fromAddress = emailSetup.mail.from.address;
          const fromName = emailSetup.mail.from.name;
          const receipts = emailSetup.mail.to;
          const textContent = stripHTML(fileContent);
          const htmlContent = fileContent;
          const subject = `Email test ${fileToSend}`;
          Promise.all(
            receipts.map((receipt) =>
              sendEmail({
                from: fromAddress,
                fromName: fromName,
                to: receipt.address,
                toName: receipt.name,
                subject: subject,
                text: textContent,
                html: htmlContent,
              })
            )
          )
            .then((results) => {
              results.forEach((result) => {
                console.log(result);
              });
              resolve();
            })
            .catch((err) => {
              console.error(err.message);
              reject(err);
            });
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
}

exports.sendToEmail = sendToEmail;
