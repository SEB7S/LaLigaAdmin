<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
.el-form{
  max-width: 470px;
  margin: auto;
}

.el-form-item {
  margin-bottom: 22px;
}

.el-message-box{
  width: 95%;
  max-width: 418px;
  margin: .5rem;
}
@media (max-width: 600px) {
  .el-dialog__wrapper{
    padding: .5rem;
  }
  .el-dialog {
    width: 100%;
  }

  .el-notification {
    max-width: 300px;
    width: 100%;
    right: 0;
    left: 0;
    margin:auto;
  }

}

</style>
