#!/bin/bash
cd "$( dirname "${BASH_SOURCE[0]}" )"
DIRNAME="content"
BASENAME=$(basename -s '.pdf' $1)
mkdir -p "$DIRNAME"
if [ ! -f "$DIRNAME/$BASENAME.pdf" ]; then
    >&2 echo "Downloading $1 to $DIRNAME/$BASENAME.pdf"
    wget -O "$DIRNAME/$BASENAME.pdf" "$1"
else
    >&2 echo "$DIRNAME/$BASENAME.pdf already cached"
fi
if [ ! -f "$DIRNAME/$BASENAME-booklet.pdf" ]; then
    >&2 echo "Creating $DIRNAME/$BASENAME-booklet.pdf"
    EMPTY_PAGE_PDF="resources/A5-empty.pdf"
    PAGES=$(pdfinfo "$DIRNAME/$BASENAME.pdf" | grep Pages | awk '{print $2}')
    MISSING_EMPTY_PAGES=$(echo "(4 - $PAGES % 4) % 4" | bc)
    PDFJAM_ARGS="$DIRNAME/$BASENAME.pdf 1-"$(echo "$PAGES - 1" | bc)
    for i in `seq 1 $MISSING_EMPTY_PAGES`;
    do
        PDFJAM_ARGS="$PDFJAM_ARGS $EMPTY_PAGE_PDF 1"
    done
    PDFJAM_ARGS="pdfjam --outfile $DIRNAME/$BASENAME-padded.pdf $PDFJAM_ARGS $DIRNAME/$BASENAME.pdf $PAGES"
    $PDFJAM_ARGS
    bookletimposer --no-gui "$DIRNAME/$BASENAME-padded.pdf"
    rm "$DIRNAME/$BASENAME-padded.pdf"
    mv "$DIRNAME/$BASENAME-padded-conv.pdf" "$DIRNAME/$BASENAME-booklet.pdf"
else
    >&2 echo "$DIRNAME/$BASENAME-booklet.pdf already cached"
fi
