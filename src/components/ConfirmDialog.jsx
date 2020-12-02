import React from "react";
import { Button } from "react-bootstrap";
import Dialog from "./bootstrap-dialog/index";

export default class ConfirmDialog extends React.Component {
  onClickOkCancel = () => {
    this.dialog.show({
      body: this.props.body,
      actions: [
        Dialog.CancelAction(),
        Dialog.OKAction(() => {
          this.props.action();
        }),
      ],
    });
  };

  render() {
    return (
      <div>
        <p>
          <Button variant="secondary" size="sm" onClick={this.onClickOkCancel}>
            {this.props.buttonText}
          </Button>
        </p>

        <Dialog
          ref={(el) => {
            this.dialog = el;
          }}
        />
      </div>
    );
  }
}
