"use client";

import React from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form } from "antd";
import { BaseType } from "../../types/types";
import { IResourceComponentsProps } from "@refinedev/core";

export interface GenericCreatePageProps<T extends BaseType>
	extends IResourceComponentsProps {
	resource: string;
	title: string;
	children: React.ReactNode;
}

const GenericCreatePage = <T extends BaseType>({
	resource,
	title,
	children,
}: GenericCreatePageProps<T>) => {
	const { formProps, saveButtonProps } = useForm<T>({
		resource,
		redirect: "show",
	});

	return (
		<Create title={title} saveButtonProps={saveButtonProps}>
			<Form {...formProps} layout="vertical">
				{children}
			</Form>
		</Create>
	);
};

export default GenericCreatePage;
