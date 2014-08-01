function CanvasGrid(canvas) {
	this.canvas = canvas;
}

CanvasGrid.prototype.fitImages = function (images) {
	var gridRowIndex, gridColIndex;
	var gridCellWidth, gridCellHeight, gridCellAspect, gridRows, gridCols;
	var currentX, currentY, currentHeight, currentWidth, currentAspect;
	var leftYSpace, leftXSpace, image;
	var cropWidth, cropHeight, cropX, cropY;

	var canvas = this.canvas;
	var context = canvas.getContext('2d');

	var initialImageWidth = 460;
	var initialImageHeight = 210;
	var canvasWidth = canvas.width;
	var canvasHeight = canvas.height;

	// define grid params so that images fill the available canvas
	// keeping the images aspect ratio as close a possible to the original
	var calculateGridParams = function (imagesNumber) {
		gridCellAspect = (canvasWidth / canvasHeight) / (initialImageWidth / initialImageHeight);
		gridRows = Math.round(Math.sqrt(imagesNumber / gridCellAspect));
		gridCols = Math.ceil(imagesNumber / gridRows);
		gridCellWidth = Math.floor(canvasWidth / gridCols);
		gridCellHeight = Math.floor(canvasHeight / gridRows);

		// if grid cell is bigger then available images
		// increase number of showed images and try again
		if (gridCellWidth > initialImageWidth || gridCellHeight > initialImageHeight) {
			calculateGridParams(imagesNumber + 1);
		}
	};
	calculateGridParams(images.length);

	currentX = 0;
	currentY = 0;

	for (gridRowIndex = 0; gridRowIndex < gridRows; gridRowIndex += 1) {
		// how much space will be left after all the rows will be filled with the same height
		leftYSpace = canvasHeight - currentY - (gridRows - gridRowIndex) * gridCellHeight;
		currentHeight = gridCellHeight + (leftYSpace && 1);

		for (gridColIndex = 0; gridColIndex < gridCols; gridColIndex += 1) {
			// how much space will be left after all the columns will be filled with the same width
			leftXSpace = canvasWidth - currentX - (gridCols - gridColIndex) * gridCellWidth;
			currentWidth = gridCellWidth + (leftXSpace && 1);

			// pick next image and start from the begining when reached the end
			image = images[(gridRowIndex * gridCols + gridColIndex) % images.length];

			// calculate the size of the images that has to be cropped
			// according to the current cell aspect ratio
			currentAspect = currentWidth / currentHeight;
			cropHeight = initialImageHeight;
			cropWidth = Math.floor(cropHeight * currentAspect);
			if (cropWidth > initialImageWidth) {
				cropWidth = initialImageWidth;
				cropHeight = Math.floor(initialImageWidth / currentAspect);
			}
			cropX = Math.floor((initialImageWidth - cropWidth) / 2);
			cropY = Math.floor((initialImageHeight - cropHeight) / 2);

			context.drawImage(image, cropX, cropY, cropWidth, cropHeight, currentX, currentY, currentWidth, currentHeight);

			currentX += currentWidth;
		}
		currentX = 0;
		currentY += currentHeight;
	}
};

if (typeof module !== 'undefined' && module.exports) {
	module.exports = CanvasGrid;
}
