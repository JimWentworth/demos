"""Simple folder watcher that halves new image dimensions and exports PNG copies.

This script monitors a target directory for new or modified image files. Whenever an
image is added (or updated), a PNG copy with dimensions reduced by 50% is saved in a
``reduced_images`` subdirectory. The watcher runs continuously until interrupted.

Usage::

    python image_reducer.py --folder /path/to/watch

The Pillow package (``PIL``) must be available in the environment running this script.
"""

from __future__ import annotations

import argparse
import logging
import signal
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, Iterator

from PIL import Image


# Default set of image file suffixes the watcher will process. All suffixes are stored
# in lowercase to allow case-insensitive matching when scanning a directory.
IMAGE_SUFFIXES = {
    ".bmp",
    ".dib",
    ".gif",
    ".jfif",
    ".jpeg",
    ".jpg",
    ".png",
    ".tif",
    ".tiff",
    ".webp",
}


@dataclass
class WatchConfig:
    """Configuration values for the directory watcher."""

    folder: Path
    output_subdir: str = "reduced_images"
    poll_interval: float = 1.0

    @property
    def output_dir(self) -> Path:
        return self.folder / self.output_subdir


class DirectoryWatcher:
    """Poll-based directory watcher that processes new or updated images."""

    def __init__(self, config: WatchConfig, *, logger: logging.Logger) -> None:
        self._config = config
        self._logger = logger
        self._processed: Dict[Path, float] = {}

    def run(self) -> None:
        """Start watching the directory until interrupted."""

        self._logger.info("Watching %s for new images…", self._config.folder)
        self._ensure_output_dir()
        try:
            for _ in self._poll_loop():
                pass
        except KeyboardInterrupt:
            self._logger.info("Stopping watcher due to user interrupt.")

    def _poll_loop(self) -> Iterator[None]:
        """Continuously scan for new or updated images."""

        while True:
            for image_path in self._discover_images():
                self._handle_image(image_path)
            time.sleep(self._config.poll_interval)
            yield None

    def _discover_images(self) -> Iterable[Path]:
        """Yield eligible image files in the watch directory."""

        for path in self._config.folder.iterdir():
            if path.is_dir():
                continue
            if path.suffix.lower() not in IMAGE_SUFFIXES:
                continue
            yield path

    def _handle_image(self, image_path: Path) -> None:
        """Resize an image if it hasn't been processed at its current state."""

        try:
            mtime = image_path.stat().st_mtime
        except OSError as exc:
            self._logger.warning("Could not stat %s: %s", image_path, exc)
            return

        processed_mtime = self._processed.get(image_path)
        if processed_mtime is not None and processed_mtime >= mtime:
            return

        self._logger.info("Processing %s", image_path.name)
        try:
            output_path = self._reduce_image(image_path)
        except Exception:
            self._logger.exception("Failed to process %s", image_path)
            return

        self._processed[image_path] = mtime
        self._logger.info("Saved reduced image to %s", output_path.relative_to(self._config.folder))

    def _ensure_output_dir(self) -> None:
        try:
            self._config.output_dir.mkdir(parents=True, exist_ok=True)
        except OSError as exc:
            raise SystemExit(f"Unable to create output directory: {exc}")

    def _reduce_image(self, image_path: Path) -> Path:
        """Resize ``image_path`` by 50%% and save the PNG copy in the output directory."""

        with Image.open(image_path) as img:
            width, height = img.size
            new_size = (max(1, width // 2), max(1, height // 2))
            resized = img.resize(new_size, Image.LANCZOS)

            output_filename = f"{image_path.stem}.png"
            output_path = self._config.output_dir / output_filename
            resized.save(output_path, format="PNG")
            return output_path


def _parse_args(argv: Iterable[str]) -> WatchConfig:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--folder",
        type=Path,
        default=Path.cwd(),
        help="Folder to watch for images (defaults to the current working directory).",
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=1.0,
        help="Polling interval in seconds. Default is 1.0.",
    )

    args = parser.parse_args(list(argv))
    folder = args.folder.expanduser().resolve()
    if not folder.exists():
        raise SystemExit(f"Watch folder does not exist: {folder}")
    if not folder.is_dir():
        raise SystemExit(f"Watch target must be a directory: {folder}")

    return WatchConfig(folder=folder, poll_interval=max(0.1, args.interval))


def _configure_logging() -> logging.Logger:
    logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s: %(message)s")
    return logging.getLogger("image_reducer")


def main(argv: Iterable[str] | None = None) -> int:
    argv = list(argv) if argv is not None else sys.argv[1:]
    config = _parse_args(argv)
    logger = _configure_logging()

    watcher = DirectoryWatcher(config, logger=logger)

    # Gracefully handle SIGTERM (e.g., when run as a background service).
    signal.signal(signal.SIGTERM, lambda *_: sys.exit(0))

    watcher.run()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
