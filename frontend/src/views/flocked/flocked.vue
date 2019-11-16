<template>
  <div>
    <!-- <div class="controls">
      <div class="line selection">
        <label class="customWrapper"
          >custom<input type="file" id="custom"
        /></label>
      </div>
      <label class="line">
        <span>Interval:</span
        ><input
          type="range"
          id="interval"
          min="20"
          max="1000"
          value="300"
          step="10"
        />
      </label>
      <label class="line">
        <span>Speed:</span
        ><input
          type="range"
          id="speed"
          min="20"
          max="500"
          value="100"
          step="5"
        />
      </label>
      <label class="line">
        <span>Speed factor:</span
        ><input type="range" id="sf" min="1" max="50" value="15" />
      </label>
    </div> -->
    <canvas id="c" width="400" height="400"></canvas>
  </div>
</template>

<script>
export default {
  name: "flocked",
  mounted() {
    let sources = [
      {
        name: "me",
        // url: window.location.origin + "/img/me.jpg"
          url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Meisje_met_de_parel.jpg/300px-Meisje_met_de_parel.jpg"
      }
    ];

    let c = document.getElementById("c");
    let ctx = c.getContext("2d");
    let size = { x: c.width, y: c.height };
    let definition = 100;
    let partSize = size.y / definition;
    let picData = [];
    let points = [];

    async function load(data) {
      if (data instanceof File) {
        return new Promise((res, rej) => {
          let reader = new FileReader();
          reader.onload = () => res(load(reader.result));
          reader.onerror = rej;
          reader.readAsDataURL(data);
        });
      }
      return new Promise((res, rej) => {
        let img = new Image();
        img.onload = () => res(img);
        img.onerror = rej;
        img.crossOrigin = "anonymous";
        img.src = data;
      });
    }
    function getLightData(image, size) {
      if (!size) {
        size = { x: image.width, y: image.height };
      }
      let c = document.createElement("canvas");
      let ctx = c.getContext("2d");
      c.width = size.x;
      c.height = size.y;
      ctx.fillRect(0, 0, c.width, c.height);
      let w = size.x;
      let h = size.y;
      let imgRatio = image.width / image.height;
      let finalRatio = w / h;
      if (imgRatio > finalRatio) {
        w = h * imgRatio;
      } else {
        h = w / imgRatio;
      }
      ctx.drawImage(image, (size.x - w) * 0.5, (size.y - h) * 0.5, w, h);
      let data = ctx.getImageData(0, 0, size.x, size.y).data;
      let ret = [];
      for (let i = 0, n = data.length; i < n; i += 4) {
        ret.push(
          (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255
        );
      }
      return ret;
    }
    let currentImage = null;
    async function prepare(source) {
      if (source === currentImage) {
        return;
      }
      currentImage = source;
      picData = [];
      let image = await load(source);
      if (currentImage !== source) {
        return;
      }
      picData = getLightData(image, size);
    }

    function at(x, y) {
      return picData[~~x + ~~y * size.x] || 0;
    }
    function addLine() {
      points.push(
        ...[...Array(definition)].map((e, i) => ({ x: 0, y: i * partSize }))
      );
    }

    let spawner = (() => {
      let last = 0;
      // interval in seconds
      let interval = 0.3;
      return {
        setInterval: v => (interval = v || 1),
        tick: dt => {
          last += dt || 0;
          if (last >= interval) {
            addLine();
            last = last % interval;
          }
        }
      };
    })();

    let speed = 100;
    let minSpeed = 0.15;

    // Under 30fps, prefer lagging than time accuracy
    let maxDT = 1 / 30;
    let previous;
    function loop(timestamp) {
      if (!previous) {
        previous = timestamp;
      }
      let dt = (timestamp - previous) * 0.001;
      if (dt > maxDT) {
        dt = maxDT;
      }
      previous = timestamp;
      spawner.tick(dt);
      ctx.fillStyle = "#34495e";
      ctx.fillRect(0, 0, size.x, size.y);
      ctx.fillStyle = "#fff";
      for (let i = points.length; i--; ) {
        let point = points[i];
        let val = 1 - at(point.x, point.y);
        let factor = minSpeed + (1 - minSpeed) * (val * val);
        point.x += speed * dt * factor;
        if (
          point.x >= size.x ||
          point.x < 0 ||
          point.y >= size.y ||
          point.y < 0
        ) {
          points.splice(i, 1);
          continue;
        }
        ctx.fillRect(point.x, point.y, 1, partSize);
      }
      requestAnimationFrame(loop);
    }

    // document.getElementById("interval").addEventListener("input", e => {
    //     console.log(e.target.value);
    //   spawner.setInterval(e.target.value / 1000);
    // });
    // document.getElementById("speed").addEventListener("input", e => {
    //     console.log(e.target.value)
    //   speed = +e.target.value;
    // });
    // document.getElementById("sf").addEventListener("input", e => {
    //     console.log(e.target.value)
    //   minSpeed = e.target.value / 100;
    // });

    spawner.setInterval(60 / 1000);
    speed = +220;
    minSpeed = 15 / 100;

    function checkSize() {
      let size = Math.min(window.innerWidth, window.innerHeight, c.width);
      c.style.width = size + "px";
      c.style.height = size + "px";
    }
    window.addEventListener("resize", checkSize);

    // c.addEventListener("click", () => {
    //   c.style.zIndex = c.style.zIndex ? "" : 5;
    // });

    // let $selection = document.querySelector(".selection");
    // sources.forEach(source => {
    //   let button = document.createElement("button");
    //   button.textContent = source.name;
    //   button.addEventListener("click", () => prepare(source.url));
    //   $selection.insertBefore(button, $selection.lastElementChild);
    // });
    // document.getElementById("custom").addEventListener("change", e => {
    //   let files = e.target.files;
    //   let file = files && files[0];
    //   if (!file) {
    //     return;
    //   }
    //   prepare(file);
    // });
    document.body.addEventListener("dragover", e => e.preventDefault());
    document.body.addEventListener("drop", e => {
      e.preventDefault();
      let dt = e.dataTransfer;
      if (dt.items) {
        let file = [...dt.items].find(e => e.kind === "file");
        if (file) {
          prepare(file.getAsFile());
        }
      } else {
        let file = dt.files[0];
        if (file) {
          prepare(file);
        }
      }
    });

    checkSize();
    prepare(sources[0].url).then(() => requestAnimationFrame(loop));
  }
};
</script>

<style lang="scss">
html,
body {
  height: 100%;
}
body {
  overflow: hidden;
  background: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Calibri, Candara, Segoe, "Segoe UI", Optima, Arial, sans-serif;
  font-size: 14px;
}

.controls {
  position: fixed;
  top: 4px;
  left: 8px;
  color: #fff;
}

.line {
  display: block;
  padding: 6px 0;
  span {
    display: inline-block;
    width: 100px;
    vertical-align: middle;
  }
}

@mixin thumb {
  appearance: none;
  width: 8px;
  height: 8px;
  background: #333;
  border: 2px solid currentColor;
  border-radius: 50%;
}
@mixin track {
  width: 100%;
  height: 1px;
  background: #fff;
  border: none;
}
input[type="range"] {
  appearance: none;
  width: 150px;
  background: transparent;
  height: 12px;
  vertical-align: middle;
  color: #fff;
  &::-webkit-slider-thumb {
    @include thumb;
    transform: translate(-50%, -50%);
  }
  &::-moz-range-thumb {
    @include thumb;
  }
  &::-ms-thumb {
    @include thumb;
    transform: none;
  }
  &::-webkit-slider-runnable-track {
    @include track;
  }
  &::-moz-range-track {
    @include track;
  }
  &::-ms-track {
    @include track;
  }
  &:focus {
    outline: none;
    color: #9df;
  }
}

.selection {
  margin-left: -2px;
}
.selection button,
.selection .customWrapper {
  background: none;
  // border: 1px solid #fff;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: currentColor;
  font: inherit;
  border-radius: 999px;
  margin: 0 2px;
  padding: 4px 12px;
  cursor: pointer;
  &:focus {
    background: rgba(255, 255, 255, 0.3);
    outline: none;
  }
}
input[type="file"] {
  display: none;
}

#c {
  box-shadow: 0 2px 10px -2px rgba(0, 0, 0, 0.5);
}
</style>
