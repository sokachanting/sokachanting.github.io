  function parseLyrics(_element) {
    
    console.log("Test");
    this.element = _element; 
    // Do not do anything if no lyrics element was found
    if (!this.element) {
      return this;
    }
    console.log("Test 1111");
    let lines = this.element.textContent.trim().split("\n");

    this.element.textContent = "";

    let lastTime = 0; // Remember last time stamp. If next lines doesn't
    // have beginning time stamp, use this value
    let lineElementsWithoutEndingTime = []; // Store elements without ending
    // time stamp and add later

    for (let i = 0; i < lines.length; i++) {
      // Make a new <div> element for the lyrics line
      let lineElement = document.createElement("div");
      lineElement.className = "rabbit-lyrics__line";
      this.element.appendChild(lineElement);
      this.lineElements.push(lineElement);

      let line = lines[i].trim();

      // Look up time stamps
      let timeStamps = line.match(/\[\d+:\d+\.\d+\]/g) || [];
      let beginningTimeStamp = line.match(/^\[\d+:\d+\.\d+\]/g) || [];
      let endingTimeStamp = line.match(/\[\d+:\d+\.\d+\]$/g) || [];

      // If this line has any timestamps, previous lines without ending
      // time stamps could use its first time stamp as ending time stamp
      if (timeStamps.length && lineElementsWithoutEndingTime.length) {
        lineElementsWithoutEndingTime.forEach(function(element) {
          element.dataset.end = this.decodeTimeStamp(timeStamps[0]);
        }, this);
        lineElementsWithoutEndingTime = [];
      }

      // Set beginning time. If not available, use lastTime instead
      if (beginningTimeStamp.length > 0) {
        lineElement.dataset.start = this.decodeTimeStamp(beginningTimeStamp[0]);
        lastTime = this.decodeTimeStamp(beginningTimeStamp[0]);
      } else {
        lineElement.dataset.start = lastTime;
      }

      // Set ending time. If not available, use Infinity instead and stored
      // for changes in future
      if (endingTimeStamp.length > 0) {
        lineElement.dataset.end = this.decodeTimeStamp(endingTimeStamp[0]);
        lastTime = this.decodeTimeStamp(endingTimeStamp[0]);
      } else {
        lineElement.dataset.end = Infinity;
        lineElementsWithoutEndingTime.push(lineElement);
      }

      // Remove parsed time stamps and append to element
      line = line.replace(/\[\d+:\d+\.\d+\]/g, "");

      // Use Non-Break Space for empty lines. Otherwise, the line hight of
      // will be 0
      if (!line) {
        line = "&nbsp;";
      }

      lineElement.innerHTML = line;
    }

    return this;
  }


  function synchronize(_inTime) {
    let time = _inTime;
    let changed = false; // If here are active lines changed
    let activeLineElements = [];

    this.lineElements.forEach(element => {
      if (time >= element.dataset.start && time <= element.dataset.end) {
        // If line should be active
        if (!element.classList.contains("rabbit-lyrics__line--active")) {
          // If it hasn't been activated
          changed = true;
          element.classList.add("rabbit-lyrics__line--active");
        }
        activeLineElements.push(element);
      } else {
        // If line should be inactive
        if (element.classList.contains("rabbit-lyrics__line--active")) {
          // If it hasn't been deactivated
          changed = true;
          element.classList.remove("rabbit-lyrics__line--active");
        }
      }
    });

    if (changed && activeLineElements.length > 0) {
      // Calculate scroll top. Vertically align active lines in middle
      let activeLinesOffsetTop =
        (activeLineElements[0].offsetTop +
          activeLineElements[activeLineElements.length - 1].offsetTop +
          activeLineElements[activeLineElements.length - 1].offsetHeight) /
        2;
      this.scrollTop = activeLinesOffsetTop - this.element.clientHeight / 2;

      // Start scrolling animation
      clearInterval(this.scrollerInterval);
      this.scrollerTimer = this.scrollerIntervalDuration;
      this.scrollerInterval = setInterval(
        this.scroll,
        this.scrollerIntervalStep
      );
    }
  }
