const {cloneDeep} = require('lodash');

module.exports = function preprocessSnapshotList(snapshotConfig) {
    // clone original list
    let articles = cloneDeep(snapshotConfig.articles);

    // sort
    if (snapshotConfig.sort.enable) {
        const sortConfig = snapshotConfig.sort;
        const compareFunction = eval(
            (typeof sortConfig.by !== "undefined" && sortConfig.by != null)
                ? `(a,b) => a.${sortConfig.by}.localeCompare(b.${sortConfig.by})`
                : sortConfig.compareFunction
        );
        articles = articles.sort(compareFunction);
    }

    // filter
    if (snapshotConfig.filter.enable)
        articles = articles.filter(eval(snapshotConfig.filter.filterFunction));

    // reverse order such that oldest items come first
    articles.reverse();

    // apply the isFrontPage tag (false for all articles so far)
    articles.forEach(a => a.isFrontPage = false);

    // put overview page to the beginning
    const frontPage = cloneDeep(snapshotConfig.frontPage);
    frontPage.isFrontPage = true;
    articles.unshift(frontPage);

    return articles;
};
