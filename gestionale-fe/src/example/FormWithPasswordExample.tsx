import Counter from "components/Counter";
import React, { Suspense, useEffect, useState } from "react";
import { axiosInstance } from "utils/index";
import { Password } from "primereact/password";
import { Divider } from "primereact/divider";
import { useForm, Controller } from "react-hook-form";
import { classNames } from "primereact/utils";
import { Button } from "primereact/button";

export default function FormWithPasswordExample() {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      password: "",
      confermaPassword: "",
    },
    shouldFocusError: false,
  });
  const onSubmit = () => {
    console.log("confermaPassword ", control.getFieldState("confermaPassword"));
    console.log("password ", control.getFieldState("password"));
  };

  const getFormErrorMessage = (name: string) => {
    let message: any = (errors as any)[name]?.message;
    return (
      (errors as any)[name] && <small className="p-error">{message}</small>
    );
  };

  const header = <div className="font-bold mb-3">Pick a password</div>;
  const footer = (
    <>
      <Divider />
      <p className="mt-2">Suggestions</p>
      <ul className="pl-2 ml-2 mt-0 line-height-3">
        <li>At least one lowercase</li>
        <li>At least one uppercase</li>
        <li>At least one numeric</li>
        <li>Minimum 8 characters</li>
      </ul>
    </>
  );

  return (
    <div className="card flex justify-content-center">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="field">
          <label
            htmlFor="password"
            className={classNames({ "p-error": errors.password })}
          >
            password*
          </label>
          <span className="p-float-label">
            <Controller
              name="password"
              control={control}
              rules={{
                required: "Password is Is required",
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/,
                  message: "Invalid password format",
                },
              }}
              render={({ field, fieldState }) => (
                <Password
                  strongRegex="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})"
                  header={header}
                  footer={footer}
                  toggleMask
                  id={field.name}
                  {...field}
                  className={classNames({ "p-invalid": fieldState.invalid })}
                />
              )}
            />
          </span>
          {getFormErrorMessage("password")}
        </div>

        <div className="field">
          <label
            htmlFor="confermaPassword"
            className={classNames({ "p-error": errors.confermaPassword })}
          >
            confermaPassword*
          </label>
          <span className="p-float-label">
            <Controller
              name="confermaPassword"
              control={control}
              rules={{
                required: "confermaPassword is Is required",
                validate: (val: string) => {
                  if (watch("password") != val) {
                    return "ERRORE MATCHING";
                  }
                  return true;
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/,
                  message: "Invalid confermaPassword format",
                },
              }}
              render={({ field, fieldState }) => (
                <Password
                  strongRegex="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})"
                  header={header}
                  footer={footer}
                  toggleMask
                  id={field.name}
                  {...field}
                  className={classNames({ "p-invalid": fieldState.invalid })}
                />
              )}
            />
          </span>
          {getFormErrorMessage("confermaPassword")}
        </div>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>

        <Button label="Submit" type="submit" className="p-button-primary" />
      </form>
    </div>
  );
}
