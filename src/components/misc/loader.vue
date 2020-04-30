<template>
  <img svg-inline class="loader" src="../../assets/img/loader.svg">
</template>

<script>
export default {
  
}
</script>

<style lang="scss">
@import '../../assets/scss/vamp';

.loader {

  svg {
    width: 20px;
    height: 20px;
  }
  path {
    transform: translateZ(0) scale(0.8);
    backface-visibility: hidden;
    perspective: 1000;
    transition: opacity $loader-animation-duration linear, transform $loader-animation-duration + 100 ease-in-out;
    transform-origin: center;
    opacity: 0;
  }

  .top,
  .right,
  .bottom,
  .left {
    animation: $loader-animation-duration infinite fade linear;
  }
  .top {
    animation-delay: $loader-animation-duration / 4 * 0;
  }
  .right {
    animation-delay: $loader-animation-duration / 4 * 1;
  }
  .bottom {
    animation-delay: $loader-animation-duration / 4 * 2;
  }
  .left {
    animation-delay: $loader-animation-duration / 4 * 3;
  }

  .group {
    fill: $ui-9;
  }
}

@keyframes fade {
  0% {
    opacity: 0;
    transform: translateZ(0) scale(0.8);
  }

  50% {
    opacity: 1;
    transform: translateZ(0) scale(1);
  }

  100% {
    opacity: 0;
    transform: translateZ(0) scale(0.8);
  }
}
</style>