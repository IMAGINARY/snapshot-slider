#!/bin/bash
EMPTY_PAGE_PDF="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/content/A5-empty.pdf"
DIRNAME=$(dirname $1)
BASENAME=$(basename -s '.pdf' $1)
PAGES=$(pdfinfo $1 | grep Pages | awk '{print $2}')
MISSING_EMPTY_PAGES=$(echo "4 - $PAGES % 4" | bc)
PDFJAM_ARGS="$1 1-"$(echo "$PAGES - 1" | bc)
for i in `seq 1 $MISSING_EMPTY_PAGES`;
do
    PDFJAM_ARGS="$PDFJAM_ARGS $EMPTY_PAGE_PDF 1"
done 
PDFJAM_ARGS="pdfjam --outfile $DIRNAME/$BASENAME-padded.pdf $PDFJAM_ARGS $1 $PAGES"
$PDFJAM_ARGS
bookletimposer --no-gui --keep "$DIRNAME/$BASENAME-padded.pdf"
