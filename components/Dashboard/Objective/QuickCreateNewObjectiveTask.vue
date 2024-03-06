<script setup lang='ts'>
interface Emits {
    (e: 'cancel'): void
}
defineEmits<Emits>()
</script>

<template>
    <div class="create-task-wrapper">
        <div class="title">Quick Create: Objective Task</div>
        <form>
            <div class="inputs">
                <BaseInput id="subject" label="Subject" name="subject" />
                <BaseInput id="description" label="Description" name="description" />
                <BaseInput id="target" label="Target" name="target" />
                <BaseInput id="subject" label="Subject" name="subject" />
                <BaseInput id="start-date" label="Start Date" name="start-date" type="date" />
                <BaseInput id="end-date" label="End Date" name="end-date" type="date" />
            </div>
            <div class="info">
                <div class="info__item">
                    <p>
                        Perfomance Objective
                    </p>
                    <p class="flex items-center">
                        <IconsTarget />
                        <span>HH</span>
                    </p>
                </div>
                <div class="info__item">
                    <p>Owner</p>
                    <p class="flex items-center">
                        <BaseAvatar name="Femi Ajayi" size="sm" />
                        <span>Femi Ajayi</span>
                    </p>
                </div>
            </div>
            <div class="buttons flex items-center">
                <BaseButton variant="grey" type="button" @click="$emit('cancel')">
                    Cancel
                </BaseButton>
                <BaseButton variant="purple">
                    Save and close
                </BaseButton>
            </div>
        </form>
    </div>
</template>

<style lang="scss" scope>
.create-task-wrapper {
    padding: 1.6rem;

    form {
        margin-top: 2.4rem;
    }

    .title {
        @include typography(2rem, normal, 2.4rem);
    }

    .inputs {
        display: grid;
        gap: 1.2rem;
    }

    .info {
        margin-top: 2rem;
        display: grid;
        gap: 2rem;

        &__item {
            display: grid;
            grid-template-columns: 0.5fr 1fr;
            align-items: center;
            gap: 4rem;

            p {
                color: #4A4A68;
            }

            p:last-of-type {
                gap: 0.8rem;
                color: $sec-brand;
            }
        }

        svg {
            height: 2rem;
            width: 2rem;
        }
    }

    .buttons {
        margin-top: 10rem;
        gap: 1.2rem;
    }
}
</style>