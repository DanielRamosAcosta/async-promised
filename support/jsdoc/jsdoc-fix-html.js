const fs = require('fs-extra');
const path = require('path');
const $ = require('cheerio');
const _ = require('lodash');

const async = require('async')
// const async = require('../../dist/async')
const { version: VERSION } = require('../../package.json');

const docsDir = path.join(__dirname, "../../docs");
const pageTitle = "Methods:";

const docFilename = "docs.html";
const mainModuleFile = "module-async.html";
const mainScrollableSection = "#main-container";
const sectionTitleClass = ".page-title";

const HTMLFileBegin = '<!DOCTYPE html>\n<html lang="en">\n<head>\n';
const HTMLFileHeadBodyJoin = "</head>\n<body>";
const HTMLFileEnd = "</body>";

const additionalFooterText =
  " Documentation has been modified from the original. " +
  ' For more information, please see the <a href="https://github.com/caolan/async">async</a> repository.';

function generateHTMLFile(filename, $page, callback) {
  const methodName = filename.match(/\/(\w+)\.js\.html$/);
  if (methodName) {
    const $thisMethodDocLink = $page
      .find("#toc")
      .find(`a[href="${docFilename}#${methodName[1]}"]`);
    $thisMethodDocLink.parent().addClass("active");
  }

  // generate an HTML file from a cheerio object
  const HTMLdata =
    HTMLFileBegin +
    $page.find("head").html() +
    HTMLFileHeadBodyJoin +
    $page.find("body").html() +
    HTMLFileEnd;

  fs.writeFile(filename, HTMLdata, callback);
}

function extractModuleFiles(files) {
  return _.filter(
    files,
    file => _.startsWith(file, "module") && file !== mainModuleFile
  );
}

function combineFakeModules(files, callback) {
  const moduleFiles = extractModuleFiles(files);

  fs.readFile(
    path.join(docsDir, mainModuleFile),
    "utf8",
    (err, mainModuleData) => {
      if (err) return callback(err);

      const $mainPage = $(mainModuleData);
      // each 'module' (category) has a separate page, with all of the
      // important information in a 'main' div. Combine all of these divs into
      // one on the actual module page (async)
      async.eachSeries(
        moduleFiles,
        (file, fileCallback) => {
          fs.readFile(path.join(docsDir, file), "utf8", (err, moduleData) => {
            if (err) return fileCallback(err);
            const $modulePage = $(moduleData);
            const moduleName = $modulePage.find(sectionTitleClass).text();
            $modulePage
              .find(sectionTitleClass)
              .attr("id", moduleName.toLowerCase());
            $mainPage
              .find(mainScrollableSection)
              .append($modulePage.find(mainScrollableSection).html());
            return fileCallback();
          });
        },
        err => {
          if (err) return callback(err);
          generateHTMLFile(
            path.join(docsDir, docFilename),
            $mainPage,
            callback
          );
        }
      );
    }
  );
}

function applyPreCheerioFixes(data) {
  const rIncorrectCFText = />ControlFlow</g;
  const fixedCFText = ">Control Flow<";

  const rIncorrectModuleText = />module:(\w+)\.(\w+)</g;

  // the heading needs additional padding at the top so it doesn't get cutoff
  return (
    data
      // for JSDoc to work, the module needs to be labelled 'ControlFlow', while
      // on the page it should appear as 'Control Flow'
      .replace(rIncorrectCFText, fixedCFText)
      // for return types, JSDoc doesn't allow replacing the link text, so it
      // needs to be done here
      .replace(
        rIncorrectModuleText,
        (match, moduleName, methodName) => `>${methodName}<`
      )
  );
}

function scrollSpyFix($page, $nav) {
  // move everything into one big ul (for Bootstrap scroll-spy)
  const $ul = $nav.children("ul");
  $ul.addClass("nav").addClass("methods");
  $ul.find(".methods").each(function() {
    const $methodsList = $(this);
    const $methods = $methodsList.find('[data-type="method"]');
    const $parentLi = $methodsList.parent();

    $methodsList.remove();
    $methods.remove();
    $parentLi.after($methods);
    $parentLi.addClass("toc-header");
  });

  $page.find('[data-type="method"]').addClass("toc-method");

  $page.find('[id^="."]').each(function() {
    const $ele = $(this);
    const id = $(this).attr("id");
    $ele.attr("id", id.replace(".", ""));
  });
}

function fixToc(file, $page, moduleFiles) {
  // remove `async` listing from toc
  $page
    .find(`a[href="${mainModuleFile}"]`)
    .parent()
    .remove();

  // change toc title
  const $nav = $page.find("nav");
  $nav.attr("id", "toc");
  $nav.children("h3").text(pageTitle);
  $nav.children("h2").remove();

  scrollSpyFix($page, $nav);

  const prependFilename = file === docFilename ? "" : docFilename;
  // make everything point to the same 'docs.html' page
  _.each(moduleFiles, filename => {
    $page.find(`[href^="${filename}"]`).each(function() {
      const $ele = $(this);
      const href = $ele.attr("href");

      // category titles should sections title, while everything else
      // points to the correct listing
      if (href === filename) {
        const moduleName = $ele
          .text()
          .toLowerCase()
          .replace(/\s/g, "")
          .replace(".", "");
        $ele.attr("href", `${prependFilename}#${moduleName}`);
      } else {
        $ele.attr(
          "href",
          href.replace(filename, prependFilename).replace("#.", "#")
        );
      }
    });
  });
}

function fixFooter($page) {
  // add a note to the footer that the documentation has been modified
  const $footer = $page.find("footer");
  $footer.append(additionalFooterText);
  $page.find(mainScrollableSection).append($footer);
}

function fixModuleLinks(files, callback) {
  const moduleFiles = extractModuleFiles(files);

  async.each(
    files,
    (file, fileCallback) => {
      const filePath = path.join(docsDir, file);
      fs.readFile(filePath, "utf8", (err, fileData) => {
        if (err) return fileCallback(err);
        const $file = $(applyPreCheerioFixes(fileData));

        const $vDropdown = $file.find("#version-dropdown");
        $vDropdown
          .find(".dropdown-toggle")
          .contents()
          .get(0).data = `v${VERSION} `;
        $vDropdown.find(`a[href="${docFilename}"]`).text(`v${VERSION}`);

        fixToc(file, $file, moduleFiles);
        fixFooter($file);
        $file.find(`[href="${mainModuleFile}"]`).attr("href", docFilename);
        generateHTMLFile(filePath, $file, fileCallback);
      });
    },
    callback
  );
}

fs.copySync(
  path.join(__dirname, "../../dist/async.js"),
  path.join(docsDir, "scripts/async.js"),
  { clobber: true }
);
fs.copySync(
  path.join(__dirname, "./jsdoc-custom.js"),
  path.join(docsDir, "scripts/jsdoc-custom.js"),
  { clobber: true }
);
fs.copySync(
  path.join(__dirname, "..", "..", "logo", "favicon.ico"),
  path.join(docsDir, "favicon.ico"),
  { clobber: true }
);
fs.copySync(
  path.join(__dirname, "..", "..", "logo", "async-logo.svg"),
  path.join(docsDir, "img", "async-logo.svg"),
  { clobber: true }
);

fs.readdir(docsDir, (err, files) => {
  if (err) {
    throw err;
  }

  const HTMLFiles = _.filter(files, file => path.extname(file) === ".html");

  async.waterfall(
    [
      callback => {
        combineFakeModules(HTMLFiles, err => {
          if (err) return callback(err);
          HTMLFiles.push(docFilename);
          return callback(null);
        });
      },
      callback => {
        // TODO: fixModuleLinks(HTMLFiles, callback);
      }
    ],
    err => {
      if (err) throw err;
      console.log("Docs generated successfully");
    }
  );
});
