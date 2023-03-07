import { useEffect } from "react";
import { useForm, isNotEmpty } from "@mantine/form";
import { Flex, Modal, Button, TextInput } from "@mantine/core";

const EditTask = ({ open, onClose, task, onTaskEdit }) => {
	const form = useForm({
		initialValues: {
			taskInput: task?.text,
		},
		validateInputOnChange: true,
		validateInputOnBlur: true,
		validate: {
			taskInput: isNotEmpty("Task cannot be empty"),
		},
	});

	useEffect(() => {
		form?.setValues({ taskInput: task?.text });
	}, [task]);

	return (
		<Modal
			opened={open}
			onClose={() => onClose(false)}
			title="Edit task"
			centered
		>
			<form
				onSubmit={form.onSubmit(() =>
					onTaskEdit(form?.values?.taskInput)
				)}
			>
				<TextInput
					placeholder="Task"
					label="Task"
					mb={20}
					{...form.getInputProps("taskInput")}
				/>

				<Flex justify="space-between" mt={50}>
					<Button variant="subtle" onClick={() => onClose(false)}>
						Cancel
					</Button>
					<Button type="submit" disabled={!form.isValid()}>
						Edit
					</Button>
				</Flex>
			</form>
		</Modal>
	);
};

export default EditTask;
