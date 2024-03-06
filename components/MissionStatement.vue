<script lang="ts" setup>
import type { GetMissionStatementData, MissionStatementData } from "~/types/apiResponse/dashboard";
const { getPeriodLabel } = usePeriodStore();

const { user: storeUser } = storeToRefs(useUserStore());



interface Props {
	employeeId: string;
	selectedPeriod: string;
	isProfile: boolean;
}
const props = defineProps<Props>();
const statements = ref<GetMissionStatementData["data"]>();

const isLoading = ref(false);

const { periods } = storeToRefs(usePeriodStore());
const periodOptions = computed(() => periods.value.map((period) => ({ label: period.name, value: period.id })));


const fetchStatement = async () => {
	if(!props.selectedPeriod && !innerPeriod.value) return
	try{
		isLoading.value = true;
	const response = await useApi<GetMissionStatementData>("/missionstatements", {
		query: {
			periodID: props.isProfile ? props.selectedPeriod : innerPeriod.value,
			employeeID: props.employeeId,
		},
	});

	isLoading.value = false;
	statements.value = response.data;
	}catch(e){
		useToast("error", "Error", "An error occurred while fetching mission statement", 3500, true);
	}finally{
		isLoading.value = false;
	}
};

// get data funtion taks in labl parameter to filter array return null or MissionStatementData

const getData = (label: string): MissionStatementData | null => {
	if (statements.value) {
		return statements.value.find((item) => item.label === label) || null;
	}
	return null;
};

const tab = ref(-1);
const innerPeriod = ref(props.selectedPeriod);


const toggleTab = (index: number) => {
	if (tab.value === index) {
		tab.value = -1;
	} else {
		tab.value = index;
	}
};

watch(
	() => props.selectedPeriod || props.employeeId,
	(nnnn) => {
		if (props.selectedPeriod && props.employeeId && (periodOptions && periodOptions.value.length > 0)) {

			if(nnnn !== innerPeriod.value){
				innerPeriod.value = props.selectedPeriod;
				return;
			}
			
			fetchStatement();
		}
	},
	{ immediate: true },
);


watch(
	() => innerPeriod.value,
	() => {
			if(periodOptions && periodOptions.value.length > 0){
				fetchStatement();
			}
	},
	{ immediate: true },
);


const action = ref<"create" | "edit" | "">("");


const statementValue = ref("");
const isPostingStatement = ref(false);
const postStatement = async () => {
	isPostingStatement.value = true;
	try {
		await useApi(`/missionstatements/${action.value === "create" ? "create" : `update/id:guid`}`, {
			method: action.value === "create" ? "POST" : "PATCH",
			body: {
				...(action.value === "edit" && { id: getData("Self")?.id }),
				period: props.selectedPeriod,
				owner: props.employeeId,
				missionStatement: statementValue.value,
			},
		});

		useToast(
			"success",
			"Success",
			`Mission statement has been ${action.value === "create" ? "created" : "updated"} successfully`,
			3500,
			true,
		);
		close();
		fetchStatement();
        tab.value = 0;
	} catch (e) {
		useToast("error", "Error", `
           An error occurred while ${action.value === "create" ? "creating" : "updating"} mission statement
        `, 3500, true);
	} finally {
		isPostingStatement.value = false;
	}
};

const open = (type: "create" | "edit") => {
	action.value = type;
	statementValue.value = getData("Self")?.missionStatement || "";
};

const close = () => {
	action.value = "";
	statementValue.value = "";
};


const isOwner = computed(() => {
    return storeUser.value?.userData?.id === props.employeeId;
});


watch(
	() => periodOptions,
	() => {
		if (periodOptions && periodOptions.value.length > 0 && !props.isProfile) {
			innerPeriod.value = periodOptions.value[0].value;
		}
	},
	{ immediate: true },
);
</script>
<template>
	<div class="mission-statement">
		<div class="mission-statement__header">
			<span>
				{{ action === "create" ? "Set" : action === "edit" ? "Edit" : "" }} Mission Statement for
				{{ getPeriodLabel(props.selectedPeriod) }}
			</span>

			<button v-if="getData('Self') && isOwner" @click="open('edit')">
				<span class="icon">
					<IconsFileEdit />
				</span>
			</button>
		</div>

		<template v-if="action === ''">
			<div v-if="isLoading" class="loading"><loader /></div>
			<template v-else>
					<div v-if="!isProfile" class="flex items-center  gap-8 period-select" style="margin-bottom:20px">
					<p>Period:</p>
					<BaseSelect
						id="period-select"
						v-model="innerPeriod"
						name="period-select"
						:options="periodOptions"
						placeholder="Choose period" />
				</div>
			<div  class="mission-statement__data">
				<div v-if="!getData('Self') && isOwner" class="empty-statement">
					<IconsNoStatement />
					<span>No mission statement yet</span>
					<button @click="open('create')">Set up your mission statement</button>
				</div>

				<div  v-if="getData('Self') || (!isOwner && !getData('Self'))" class="group">
					<div class="group__header" @click="toggleTab(0)">
						<span class="title">{{
                            isOwner ? "My" : "Employee's"
                            }} mission statement</span>
						<button>
							<span class="icon">
								<IconsChevronUp v-if="tab === 0" />
								<IconsChevronDown v-else />
							</span>
						</button>
					</div>
					<div v-if="tab === 0" class="group__body">
						<template v-if="getData('Self')">
							{{ getData("Self")?.missionStatement }}
						</template>
						<template v-else>No mission statement addd yet</template>
					</div>
				</div>

				<div class="group">
					<div class="group__header" @click="toggleTab(1)">
						<span class="title">Manager's mission statement</span>
						<button>
							<span class="icon">
								<IconsChevronUp v-if="tab === 1" />
								<IconsChevronDown v-else />
							</span>
						</button>
					</div>
					<div v-if="tab === 1" class="group__body">
						<template v-if="getData('Manager')">
							{{ getData("Manager")?.missionStatement }}
						</template>
						<template v-else>No mission statement addd yet</template>
					</div>
				</div>

					<div class="group">
					<div class="group__header" @click="toggleTab(2)">
						<span class="title">Manager’s Manager mission statement</span>
						<button>
							<span class="icon">
								<IconsChevronUp v-if="tab === 2" />
								<IconsChevronDown v-else />
							</span>
						</button>
					</div>
					<div v-if="tab === 2" class="group__body">
						<template v-if="getData('ManagerBoss')">
							{{ getData("ManagerBoss")?.missionStatement }}
						</template>
						<template v-else>No mission statement addd yet</template>
					</div>
				</div>
			</div>
			</template>
		</template>

		<div v-if="action === 'create' || action === 'edit'" class="mission-statement__form">
			<BaseTextArea
				id="description"
				v-model.trim="statementValue"
				label="Mission Statement"
				name=""
				sizing="padding"
				padding="1.6rem"
				:required="true" />

			<div class="actions">
				<BaseButton variant="grey" type="button" :disabled="isPostingStatement" @click="close">
					Cancel
				</BaseButton>
				<BaseButton
					variant="purple"
					:loading="isPostingStatement"
					:disabled="!statementValue"
					@click="postStatement">
					Save and close
				</BaseButton>
			</div>
		</div>
	</div>
</template>
<style lang="scss" scoped>
.mission-statement {
	padding: 20px;
	padding-top: 10px;
	max-width: 480px;

	&__header {
		color: #000;
		font-weight: 500;
		font-size: 24px;
		margin-bottom: 20px;
		display: flex;
		justify-content: space-between;
		gap: 10px;

		button {
			@include element-size(2.4rem, 2.34rem);
			background-color: transparent;
			border-radius: 50%;
			margin-left: auto;
			line-height: 0;

			.icon {
				@include element-size(1rem, 0.96rem);
			}
		}
	}

	.loading {
		padding: 30px 0px;
		text-align: center;
	}

	&__data {
		.empty-statement {
			display: flex;
			flex-direction: column;
			align-items: center;
			border: 1px solid $outline;
			border-radius: 12px;
			padding: 20px;

			span {
				font-weight: 600;
				color: $dark-grey;
				display: block;
				margin: 10px 0px;
			}

			button {
				font-weight: 600;
				background-color: transparent;
				color: $sec-brand;
				text-decoration: underline;
			}
		}

		.group {
			border: 1px solid $outline;
			border-radius: 12px;
			padding: 12px 20px;
			margin-bottom: 10px;

			&__header {
				display: flex;
				width: 100%;
				align-items: center;
				cursor: pointer;
				padding: 5px 0px;

				.title {
					font-weight: 600;
					color: $dark-grey;
					display: block;
					flex: 1;
				}

				button {
					@include element-size(2.4rem, 2.34rem);
					background-color: transparent;
					border-radius: 50%;
					margin-left: auto;
					line-height: 0;

					.icon {
						@include element-size(1rem, 0.96rem);
					}
				}
			}

			&__body {
				padding: 10px 0px;
				color: #4a4a68;
				font-weight: 500;
				font-size: 16px;
				line-height: 22.4px;
			}
		}
	}

    &__form {
        .actions {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
    }
}
</style>
