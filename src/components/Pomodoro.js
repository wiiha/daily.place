import { useState, useEffect } from "react";
import {
	Stack,
	ActionIcon,
	Flex,
	Text,
	Badge,
	Modal,
	Button,
	SegmentedControl,
	NumberInput,
} from "@mantine/core";
import { useForm, isNotEmpty } from "@mantine/form";
import {
	IconHourglassHigh,
	IconPlayerPlay,
	IconPlayerPause,
	IconReload,
	IconSettings,
} from "@tabler/icons";
import { useLocalStorage } from "@mantine/hooks";
import Title from "./common/Title";
import { formatTime } from "@/helpers/formatTime";

const POMODORO_MODES = [
	{ label: "Pomodoro", value: "pomodoro" },
	{ label: "Short break", value: "short" },
	{ label: "Long break", value: "long" },
];

const Pomodoro = ({ name }) => {
	const [storage, setStorage] = useLocalStorage({
		key: `dailyPomodoro_${name}`,
		defaultValue: {
            pomodoro: 25,
            shortBreak: 5,
            longBreak: 10,
            pomodoroToday: 0
        },
	});

	const [mode, setMode] = useState(POMODORO_MODES[0].value);
	const [secondsLeft, setSecondsLeft] = useState(storage?.pomodoro * 60);
	const [isActive, setIsActive] = useState(false);
	const [opened, setOpened] = useState(false);

	const form = useForm({
		initialValues: {
			pomodoro: storage?.pomodoro,
			shortBreak: storage?.shortBreak,
			longBreak: storage?.longBreak,
		},
		validateInputOnChange: true,
		validate: {
			pomodoro: value => (value < 1 ? "Number required" : null),
			pomodoro: isNotEmpty("Pomodoro time cannot be empty"),
			shortBreak: value => (value < 1 ? "Number required" : null),
			shortBreak: isNotEmpty("Short break time cannot be empty"),
			longBreak: value => (value < 1 ? "Number required" : null),
			longBreak: isNotEmpty("Long break time cannot be empty"),
		},
	});

    useEffect(() => {
        console.log(storage)
        form.setValues(storage);
        restartPomodoro();
    }, [storage]);

	useEffect(() => {
		restartPomodoro();
	}, [mode]);

	useEffect(() => {
		if (isActive) {
			const interval = setInterval(() => {
				setSecondsLeft(secondsLeft => secondsLeft - 1);
			}, 1000);

			if (secondsLeft === 0) {
				clearInterval(interval);
				restartPomodoro();
			}

			if (secondsLeft === 0 && mode == "pomodoro") {
				/*setPomodorosToday(prevState => prevState + 1);*/
                setStorage({
                    ...storage,
                    pomodoroToday: storage?.pomodoroToday + 1
                })
			}

			return () => clearInterval(interval);
		}
	}, [isActive, secondsLeft]);

	const restartPomodoro = () => {
		setIsActive(false);

		switch (mode) {
			case "short":
				setSecondsLeft(storage?.shortBreak * 60);
				break;
			case "long":
				setSecondsLeft(storage?.longBreak * 60);
				break;
			default:
				setSecondsLeft(storage?.pomodoro * 60);
		}
	};

	const savePomodoroConfiguration = () => {
		switch (mode) {
			case "short":
				setSecondsLeft(form?.values?.shortBreak * 60);
				break;
			case "long":
				setSecondsLeft(form?.values?.longBreak * 60);
				break;
			default:
				setSecondsLeft(form?.values?.pomodoro * 60);
		}
        setStorage({
            ...storage,
            pomodoro: form?.values?.pomodoro,
            shortBreak: form?.values?.shortBreak,
            longBreak: form?.values?.longBreak,
        });
		setOpened(false);
		setIsActive(false);
	};

	return (
		<>
			<Stack w="100%">
				<Title icon={<IconHourglassHigh />} text="Pomodoro">
					<ActionIcon variant="light" onClick={() => setOpened(true)}>
						<IconSettings size={18} />
					</ActionIcon>
				</Title>
				<Flex w="100%" sx={_ => ({
						"@media (max-width: 768px)": {
							justifyContent: "center",
						},
					})}>
					<SegmentedControl
						size="xs"
						value={mode}
						data={POMODORO_MODES}
						onChange={value => setMode(value)}
					/>
				</Flex>
				<Flex align="center" justify="space-between" sx={_ => ({
						"@media (max-width: 768px)": {
							justifyContent: "center",
                            gap: 20
						},
					})}>
					<Text fz={48} fw={600}>
						{formatTime(secondsLeft)}
					</Text>
					<Flex gap="xs">
						{isActive ? (
							<ActionIcon
								color="red"
								variant="light"
								onClick={() => setIsActive(false)}
							>
								<IconPlayerPause size={18} />
							</ActionIcon>
						) : (
							<ActionIcon
								color="green"
								variant="light"
								onClick={() => setIsActive(true)}
							>
								<IconPlayerPlay size={18} />
							</ActionIcon>
						)}

						<ActionIcon variant="light" onClick={restartPomodoro}>
							<IconReload size={18} />
						</ActionIcon>
					</Flex>
				</Flex>
				<Text fz={14} sx={_ => ({
						"@media (max-width: 768px)": {
							textAlign: "center",
						},
					})}>
					<Badge color="green" radius="sm">
						{storage?.pomodoroToday}
					</Badge>{" "}
					completed today
				</Text>
			</Stack>

			<Modal
				opened={opened}
				onClose={() => setOpened(false)}
				title="Pomodoro configuration"
				centered
			>
				<Stack>
					<NumberInput
						label="Pomodoro time"
						description="in minutes"
						{...form.getInputProps("pomodoro")}
						min={1}
						step={5}
					/>

					<NumberInput
						label="Short break time"
						description="in minutes"
						{...form.getInputProps("shortBreak")}
						min={1}
						step={5}
					/>

					<NumberInput
						label="Long break time"
						description="in minutes"
						{...form.getInputProps("longBreak")}
						min={1}
						step={5}
					/>
				</Stack>

				<Flex justify="space-between" mt={50}>
					<Button variant="subtle" onClick={() => setOpened(false)}>
						Cancel
					</Button>
					<Button
						onClick={savePomodoroConfiguration}
						disabled={!form.isValid()}
					>
						Save
					</Button>
				</Flex>
			</Modal>
		</>
	);
};

export default Pomodoro;