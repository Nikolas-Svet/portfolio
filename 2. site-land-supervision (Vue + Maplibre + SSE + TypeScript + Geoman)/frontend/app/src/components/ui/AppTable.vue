<template>
  <table class="table">
    <slot name="THeader" />
    <slot name="TBody" />
  </table>
</template>

<style lang="scss">
.table {
  table-layout: auto;
  width: 100%;
  border-collapse: collapse;

  &__input {
    border-radius: 0;
    outline: none;
    padding: 0 8px;
  }

  img {
    height: 30px;
    width: 30px;

    &:last-child {
      margin-right: 23px;
      margin-left: 20px;
    }
  }

  thead {
    position: sticky;
    top: 0;

    tr {
      border: none;
    }
  }

  tbody {
    td {
      text-align: left;
      text-wrap: wrap;
    }

    tr {
      transition: all 0.3s ease !important;
    }
  }

  th {
    height: 59px;
    font-family: $Golos_Text_Medium;
  }

  td {
    background-color: transparent;
  }

  & th,
  td {
    text-align: center;
    white-space: nowrap;
    border: none;
    padding: 16px;
    font-weight: 400;
  }
}
</style>