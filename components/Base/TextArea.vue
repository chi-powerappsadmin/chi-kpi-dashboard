<script setup lang='ts'>
interface Props {
    label?: string
    name: string,
    id: string
    hasError?: boolean
    errorMessage?: string
}

const { label, hasError = false, errorMessage = '' } = defineProps<Props>();

const modelValue = defineModel()
</script>

<template>
    <div class="textarea-wrapper">
        <label v-if="label" :for="id">{{ label }}</label>
        <textarea :id="id" v-model="modelValue" v-bind="$attrs" :name="name" class="textarea weight-600" :class="{
            'textarea-hasError': hasError
        }"></textarea>
        <p v-if="hasError && errorMessage" class="textarea__error-message">{{ errorMessage }}</p>
    </div>
</template>

<style lang="scss" scoped>
.textarea-wrapper {
    text-align: left;

    label {
        font-size: 1.2rem;
        color: $text;
        margin-bottom: 0.8rem;
        display: inline-block;
    }

    .textarea {
        padding: 1.2rem 1.6rem;
        border: 1px solid $outline;
        border-radius: 0.8rem;
        outline: none;
        resize: none;
        height: 12rem;
        width: 100%;
        background-color: transparent;

        &:focus:not(.textarea-hasError),
        &:hover:not(.textarea-hasError) {
            border-color: $grey;
        }

        &::placeholder {
            font-size: 1.2rem;
            color: $grey;
        }

        &-hasError {
            border-color: $danger;
        }

        &:disabled {
            cursor: not-allowed;
        }
    }

    .textarea__error-message {
        font-size: 1.2rem;
        color: $danger;
    }
}
</style>